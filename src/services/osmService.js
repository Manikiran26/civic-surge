// src/services/osmService.js

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

let cachedInfra = null;
let isFetching = false;

/**
 * Fetches civic infrastructure from OSM using Overpass API
 * @param {object} userLocation - { lat, lng } or null
 * @returns {Promise<Array>} List of infrastructure markers
 */
export async function fetchInfrastructure(userLocation = null) {
  if (isFetching) {
    console.log("Fetch already in progress, waiting...");
    return [];
  }

  if (!userLocation) {
    console.warn("OSM Fetch requested without valid userLocation. Aborting.");
    return [];
  }

  const { lat, lng } = userLocation;

  // 1. Dynamic Nearby Bounding Box (Expanded to 0.15 for local intel)
  const offset = 0.15;
  const south = (lat - offset).toFixed(4);
  const west = (lng - offset).toFixed(4);
  const north = (lat + offset).toFixed(4);
  const east = (lng + offset).toFixed(4);
  const nearbyBounds = `${south},${west},${north},${east}`;

  // 2. Static High-Intelligence Bounding Box (Central Delhi Core)
  const delhiBounds = "28.5500,77.1000,28.6500,77.3000";

  const query = `
    [out:json];
    (
      node["amenity"="hospital"](${nearbyBounds});
      node["amenity"="school"](${nearbyBounds});
      node["amenity"="college"](${nearbyBounds});
      node["highway"](${nearbyBounds});
      node["building"="government"](${nearbyBounds});
      node["office"="government"](${nearbyBounds});

      node["amenity"="hospital"](${delhiBounds});
      node["amenity"="school"](${delhiBounds});
      node["amenity"="college"](${delhiBounds});
      node["highway"](${delhiBounds});
      node["building"="government"](${delhiBounds});
      node["office"="government"](${delhiBounds});
    );
    out;
  `;

  isFetching = true;
  console.log(`Fetching Balanced High-Intelligence NCR Data...`);

  try {
    const fetchWithRetry = async (retries = 1) => {
      const response = await fetch(OVERPASS_URL, {
        method: "POST",
        body: query,
      });

      if (response.status === 429 && retries > 0) {
        console.warn("429 Too Many Requests. Retrying in 2s...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(retries - 1);
      }

      if (!response.ok) throw new Error(`OSM Fetch failed: ${response.status}`);
      return await response.json();
    };

    const data = await fetchWithRetry();
    
    if (!data.elements || data.elements.length === 0) {
      console.warn("No elements found in Overpass response");
      return cachedInfra || [];
    }

    // Process and Deduplicate
    const processed = processOSMData(data.elements, lat, lng);
    
    // Final ID-based unique Map (Deduplicates Nearby vs Delhi)
    const uniqueMap = new Map();
    processed.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    cachedInfra = Array.from(uniqueMap.values());
    console.log(`Optimization: Processed ${data.elements.length} raw -> Balanced ${cachedInfra.length} unique markers`);

    isFetching = false;
    return cachedInfra;
  } catch (error) {
    console.error("Error fetching OSM data:", error);
    isFetching = false;
    return cachedInfra || [];
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function isNearby(userLat, userLng, nodeLat, nodeLng) {
  const dist = getDistance(userLat, userLng, nodeLat, nodeLng);
  return dist <= 3; // 3 km
}

function determineType(tags) {
  if (!tags) return "infrastructure";
  if (tags.amenity === "hospital") return "healthcare";
  if (tags.amenity === "school" || tags.amenity === "college") return "education";
  if (tags.building === "government" || tags.office === "government") return "infrastructure";
  if (tags.highway) return "transport";
  return "infrastructure";
}

function generateBudget(type) {
  const ranges = {
    healthcare: [300, 900],
    education: [100, 400],
    transport: [500, 2000],
    infrastructure: [200, 800]
  };

  const [min, max] = ranges[type] || [100, 500];
  return `₹${Math.floor(Math.random() * (max - min) + min)} Cr`;
}

function generateTimeline() {
  const start = 2022 + Math.floor(Math.random() * 3); // 2022–2024
  const end = start + 2 + Math.floor(Math.random() * 2); // +2–4 years
  return `${start}–${end}`;
}

function getProjectName(type) {
  switch (type) {
    case "transport": return "Delhi Metro Phase 4";
    case "healthcare": return "Government Hospital - Sector 18";
    case "education": return "Delhi Smart Public School";
    case "infrastructure": return "City Bridge Project - Yamuna Link";
    default: return "Public Infrastructure Project";
  }
}

function generateImpact(type) {
  switch(type) {
    case "healthcare":
      return "Improves access to critical medical services and emergency care.";
    case "education":
      return "Enhances educational infrastructure and student capacity.";
    case "infrastructure":
      return "Supports urban development and public service delivery.";
    case "transport":
      return "Reduces congestion and improves regional connectivity.";
    default:
      return "General civic improvement and local development initiative.";
  }
}

function generateProjectStatus() {
  const statuses = ["Ongoing", "Completed", "Planned"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function generateProgress() {
  return Math.floor(Math.random() * 60) + 30; // 30%–90%
}

function processOSMData(elements, userLat, userLng) {
  // Use a balanced bucket strategy to prevent any category from drowning others
  const buckets = {
    healthcare: [],
    education: [],
    infrastructure: [],
    transport: []
  };

  elements.forEach(el => {
    const type = determineType(el.tags);
    const category = type;
    
    if (!el.lat && !el.center) return;
    
    const pLat = parseFloat(el.lat || el.center?.lat);
    const pLng = parseFloat(el.lon || el.center?.lon);

    if (!isNearby(userLat, userLng, pLat, pLng)) return;

    const item = {
      id: el.id || `node_${Date.now()}_${Math.random()}`,
      name: getProjectName(type),
      lat: pLat,
      lng: pLng,
      type: type,
      category: category,
      agency: el.tags?.operator || "Public Authority",
      budget: generateBudget(type),
      timeline: generateTimeline(),
      impact: generateImpact(type),
      status: generateProjectStatus(),
      completion: generateProgress(),
      progress: generateProgress(),
    };

    if (buckets[category]) {
      buckets[category].push(item);
    } else {
      buckets.infrastructure.push(item);
    }
  });

  // Take up to 5 from each bucket for visual diversity and performance
  const balanced = [
    ...buckets.healthcare.slice(0, 5),
    ...buckets.education.slice(0, 5),
    ...buckets.infrastructure.slice(0, 5),
    ...buckets.transport.slice(0, 5)
  ];

  console.log("Category Balance Trace:", {
    Healthcare: buckets.healthcare.length,
    Education: buckets.education.length,
    Infrastructure: buckets.infrastructure.length,
    Transport: buckets.transport.length
  });
  return balanced.slice(0, 20);
}

export const osmCategoryColors = {
  healthcare: "#ef4444", // Red (as requested)
  education: "#3b82f6",  // Blue (as requested)
  infrastructure: "#eab308", // Yellow (as requested for government)
  transport: "#22c55e",  // Green (as requested for roads)
};
