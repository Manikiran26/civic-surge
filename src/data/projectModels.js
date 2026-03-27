function box(role, position, size, extra = {}) {
  return { shape: "box", role, position, size, ...extra };
}

function cylinder(role, position, radiusTop, radiusBottom, height, extra = {}) {
  return { shape: "cylinder", role, position, radiusTop, radiusBottom, height, ...extra };
}

function cone(role, position, radius, height, extra = {}) {
  return { shape: "cone", role, position, radius, height, ...extra };
}

function sphere(role, position, radius, extra = {}) {
  return { shape: "sphere", role, position, radius, ...extra };
}

function torus(role, position, radius, tube, extra = {}) {
  return { shape: "torus", role, position, radius, tube, ...extra };
}

function repeatColumns(count, spacing, zOffset, height, role = "dark") {
  return Array.from({ length: count }, (_, index) => {
    const x = (index - (count - 1) / 2) * spacing;
    return cylinder(role, [x, height / 2 - 0.9, zOffset], 0.12, 0.16, height, { radialSegments: 12 });
  });
}

function modelBase(meta, elements, extra = {}) {
  return {
    title: meta.title,
    family: meta.family,
    summary: meta.summary,
    scale: extra.scale ?? 1,
    turnRate: extra.turnRate ?? 0.006,
    floorRadius: extra.floorRadius ?? 4.2,
    elements,
  };
}

function metroModel(meta, options = {}) {
  const viaductLength = options.viaductLength ?? 5.6;
  const stationWidth = options.stationWidth ?? 2.1;
  const stationHeight = options.stationHeight ?? 1.2;
  const trainCars = options.trainCars ?? 3;
  const supportCount = options.supportCount ?? 3;
  const undergroundTube = options.undergroundTube ?? false;
  const trainOffset = options.trainOffset ?? 0.55;
  const stationY = options.stationY ?? 0.55;
  const elements = [
    box("dark", [0, -0.92, 0], [6.2, 0.18, 6.2]),
    box("neutral", [0, stationY, 0], [viaductLength, 0.26, stationWidth]),
    box("glass", [0, stationY + stationHeight * 0.55, 0], [viaductLength * 0.72, stationHeight, stationWidth * 0.82]),
    box("accent", [0, stationY + stationHeight + 0.16, 0], [viaductLength * 0.84, 0.12, stationWidth * 0.94]),
    ...repeatColumns(supportCount, viaductLength / Math.max(1, supportCount - 1), 0, 1.35),
    box("warning", [0, stationY + 0.08, 0], [viaductLength * 0.78, 0.05, 0.08]),
  ];

  for (let index = 0; index < trainCars; index += 1) {
    const x = -viaductLength * 0.26 + index * 0.78;
    elements.push(box(index % 2 === 0 ? "accent" : "secondary", [x, stationY + trainOffset, 0], [0.7, 0.36, 0.72]));
  }

  if (options.addConcourse) {
    elements.push(box("neutral", [0, 0.02, -1.35], [2.2, 0.8, 1.15]));
    elements.push(box("glass", [0, 0.62, -1.35], [1.8, 0.55, 0.92]));
  }

  if (undergroundTube) {
    elements.push(cylinder("dark", [0, 0.16, 0], 0.9, 0.9, viaductLength + 0.6, { rotation: [0, 0, Math.PI / 2], openEnded: true }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0065,
    floorRadius: options.floorRadius ?? 4.4,
  });
}

function wastewaterModel(meta, options = {}) {
  const tankCount = options.tankCount ?? 3;
  const elements = [
    box("dark", [0, -0.92, 0], [6, 0.18, 6]),
    box("neutral", [0, -0.5, -1.35], [2.2, 0.52, 1.2]),
    box("glass", [0, -0.1, -1.35], [1.8, 0.34, 0.92]),
    box("accent", [0, -0.2, 0.95], [3.8, 0.14, 0.32]),
  ];

  for (let index = 0; index < tankCount; index += 1) {
    const x = (index - (tankCount - 1) / 2) * 1.55;
    elements.push(cylinder(index % 2 === 0 ? "secondary" : "accent", [x, -0.08, 0.2], 0.56, 0.56, 0.48, { radialSegments: 24 }));
    elements.push(cylinder("glass", [x, 0.18, 0.2], 0.42, 0.42, 0.16, { radialSegments: 24 }));
  }

  if (options.addDigesters) {
    elements.push(cylinder("neutral", [-1.7, 0.16, 1.72], 0.38, 0.38, 0.82, { radialSegments: 18 }));
    elements.push(cylinder("neutral", [1.7, 0.16, 1.72], 0.38, 0.38, 0.82, { radialSegments: 18 }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.06,
    turnRate: options.turnRate ?? 0.0055,
  });
}

function hospitalModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6, 0.18, 6]),
    box("neutral", [0, -0.04, 0], [2.8, 1.3, 1.9]),
    box("glass", [0, 0.54, 0.94], [2.15, 0.5, 0.16]),
    box("neutral", [-1.82, -0.14, 0.1], [1.15, 1.02, 1.42]),
    box("neutral", [1.82, -0.14, 0.1], [1.15, 1.02, 1.42]),
    box("accent", [0, 1.04, 0.96], [0.88, 0.18, 0.18]),
    box("accent", [0, 1.04, 0.96], [0.18, 0.88, 0.18]),
    box("secondary", [0, -0.36, 1.45], [0.84, 0.3, 0.68]),
  ];

  if (options.helipad) {
    elements.push(cylinder("neutral", [1.7, 1.18, -0.3], 0.48, 0.48, 0.08, { radialSegments: 20 }));
    elements.push(box("accent", [1.7, 1.25, -0.3], [0.52, 0.05, 0.14]));
    elements.push(box("accent", [1.7, 1.25, -0.3], [0.14, 0.05, 0.52]));
  }

  if (options.traumaTower) {
    elements.push(box("glass", [0, 1.12, -0.8], [0.92, 0.7, 0.92]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0058,
  });
}

function railStationModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6.3, 0.18, 6.3]),
    box("neutral", [0, -0.34, 0], [4.6, 0.28, 1.9]),
    box("accent", [0, 0.54, 0], [4.3, 0.1, 2.1]),
    box("glass", [0, 0.12, 0], [3.5, 0.82, 1.5]),
    box("neutral", [0, 0.96, 0], [2.6, 0.28, 1.1]),
    box("warning", [0, -0.18, 0.42], [5.1, 0.05, 0.08]),
    box("warning", [0, -0.18, -0.42], [5.1, 0.05, 0.08]),
  ];

  if (options.heritageDome) {
    elements.push(cone("secondary", [-1.1, 1.18, 0], 0.42, 0.72, { radialSegments: 6 }));
    elements.push(cone("secondary", [1.1, 1.18, 0], 0.42, 0.72, { radialSegments: 6 }));
    elements.push(box("neutral", [0, 0.9, -1.1], [0.86, 0.72, 0.86]));
  }

  if (options.multimodalWing) {
    elements.push(box("glass", [1.78, 0.08, -0.95], [1.1, 0.78, 0.86]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.05,
    turnRate: options.turnRate ?? 0.0056,
  });
}

function portModel(meta, options = {}) {
  const craneCount = options.craneCount ?? 3;
  const elements = [
    box("dark", [0, -0.92, 0], [6.4, 0.18, 6.4]),
    box("secondary", [0, -0.78, -1.5], [6.1, 0.08, 2.1]),
    box("neutral", [0, -0.48, 0.85], [4.2, 0.52, 1.35]),
    box("glass", [0, -0.08, 0.85], [3.2, 0.34, 1.08]),
    box("accent", [0, -0.42, -0.28], [4.8, 0.14, 0.28]),
  ];

  for (let index = 0; index < craneCount; index += 1) {
    const x = -1.9 + index * 1.9;
    elements.push(box("accent", [x, 0.14, -0.88], [0.18, 1.55, 0.18]));
    elements.push(box("warning", [x + 0.42, 0.72, -0.88], [0.96, 0.14, 0.14]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.08,
    turnRate: options.turnRate ?? 0.0048,
  });
}

function corridorModel(meta, options = {}) {
  const rampCount = options.rampCount ?? 0;
  const viaduct = options.viaduct ?? false;
  const elements = [
    box("dark", [0, -0.92, 0], [6.5, 0.18, 6.5]),
    box("dark", [0, -0.5, 0], [5.2, 0.18, 1.6]),
    box("warning", [0, -0.38, 0], [5.2, 0.04, 0.1]),
    box("warning", [0, -0.38, 0.5], [5.2, 0.03, 0.06]),
    box("warning", [0, -0.38, -0.5], [5.2, 0.03, 0.06]),
  ];

  if (viaduct) {
    elements.push(...repeatColumns(3, 1.8, 0, 1.05, "neutral"));
    elements.push(box("neutral", [0, 0.1, 0], [5.1, 0.14, 1.52]));
  }

  for (let index = 0; index < rampCount; index += 1) {
    const x = index === 0 ? -1.8 : 1.8;
    const z = index === 0 ? -1.35 : 1.35;
    elements.push(box("accent", [x, -0.34, z], [1.7, 0.08, 0.52], { rotation: [0, index === 0 ? -0.45 : 0.45, 0] }));
  }

  if (options.bridgeArch) {
    elements.push(torus("accent", [0, 0.16, 0], 1.08, 0.08, { rotation: [0, 0, Math.PI] }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.04,
    turnRate: options.turnRate ?? 0.0051,
  });
}

function railLineModel(meta, options = {}) {
  const trackCount = options.trackCount ?? 2;
  const trainCount = options.trainCount ?? 1;
  const elements = [
    box("dark", [0, -0.92, 0], [6.4, 0.18, 6.4]),
    box("dark", [0, -0.56, 0], [5.4, 0.18, 2.3]),
  ];

  for (let index = 0; index < trackCount; index += 1) {
    const z = trackCount === 1 ? 0 : -0.62 + index * 1.24;
    elements.push(box("neutral", [0, -0.36, z + 0.12], [5.2, 0.05, 0.08]));
    elements.push(box("neutral", [0, -0.36, z - 0.12], [5.2, 0.05, 0.08]));
    elements.push(box("warning", [0, -0.48, z], [5.1, 0.03, 0.62]));
  }

  for (let index = 0; index < trainCount; index += 1) {
    const x = -0.6 + index * 1.4;
    elements.push(box(index % 2 === 0 ? "accent" : "secondary", [x, 0.02, 0], [1.1, 0.42, 0.8]));
  }

  if (options.addOverbridge) {
    elements.push(box("glass", [0, 0.68, 0], [1.1, 0.26, 2.1]));
    elements.push(cylinder("neutral", [-0.4, 0.18, 0.86], 0.08, 0.08, 0.9));
    elements.push(cylinder("neutral", [0.4, 0.18, -0.86], 0.08, 0.08, 0.9));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0054,
  });
}

function rrtsModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6.2, 0.18, 6.2]),
    box("neutral", [0, 0.08, 0], [5.4, 0.18, 1.8]),
    ...repeatColumns(4, 1.5, 0, 1.18, "dark"),
    box("glass", [0, 0.88, 0], [3.2, 0.58, 1.3]),
    box("accent", [0, 1.24, 0], [3.6, 0.08, 1.42]),
    box("secondary", [-0.6, 0.54, 0], [1.2, 0.42, 0.76]),
    box("secondary", [0.72, 0.54, 0], [1.35, 0.42, 0.76]),
  ];

  if (options.addPortal) {
    elements.push(cylinder("dark", [2.2, 0.22, 0], 0.74, 0.74, 1.4, { rotation: [0, 0, Math.PI / 2], openEnded: true }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.06,
    turnRate: options.turnRate ?? 0.0062,
  });
}

function airportModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6.8, 0.18, 6.8]),
    box("neutral", [0, -0.62, 0], [6.2, 0.08, 1.4]),
    box("warning", [0, -0.56, 0], [6.2, 0.02, 0.08]),
    box("glass", [-0.8, -0.1, 1.45], [2.7, 0.72, 1.1]),
    box("neutral", [-0.8, 0.34, 1.45], [3.0, 0.14, 1.26]),
    cylinder("accent", [1.8, 0.02, 1.4], 0.18, 0.22, 1.62, { radialSegments: 14 }),
    box("secondary", [1.8, 0.92, 1.4], [0.7, 0.22, 0.7]),
    box("accent", [0.95, -0.34, 0], [1.05, 0.26, 0.92]),
  ];

  if (options.addJetBridge) {
    elements.push(box("glass", [0.38, 0.04, 0.94], [1.1, 0.16, 0.22]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.08,
    turnRate: options.turnRate ?? 0.0049,
  });
}

function campusModel(meta, options = {}) {
  const wingCount = options.wingCount ?? 3;
  const elements = [
    box("dark", [0, -0.92, 0], [6.6, 0.18, 6.6]),
    box("neutral", [0, -0.22, 0], [2.0, 1.0, 1.5]),
    box("glass", [0, 0.34, 0.82], [1.5, 0.42, 0.16]),
    cylinder("accent", [0, -0.78, 0], 1.9, 1.9, 0.04, { radialSegments: 30 }),
  ];

  for (let index = 0; index < wingCount; index += 1) {
    const angle = (Math.PI * 2 * index) / wingCount;
    const x = Math.cos(angle) * 1.7;
    const z = Math.sin(angle) * 1.7;
    elements.push(box(index % 2 === 0 ? "secondary" : "neutral", [x, -0.15, z], [1.1, 0.86, 0.92], { rotation: [0, -angle, 0] }));
  }

  if (options.addAuditorium) {
    elements.push(cylinder("accent", [-1.85, -0.18, -1.82], 0.62, 0.72, 0.72, { radialSegments: 18 }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.05,
    turnRate: options.turnRate ?? 0.0047,
  });
}

const savedProjectModels = {
  "bennett-university-mobility-hub": campusModel(
    {
      title: "Campus mobility hub",
      family: "education",
      summary: "Student mobility hub with plaza spine and transit canopy.",
    },
    { wingCount: 3, addAuditorium: true, scale: 1.04 }
  ),
  "bharat-mandapam-civic-hub": campusModel(
    {
      title: "Convention plaza + mobility hub",
      family: "civic",
      summary: "Public plaza spine with shaded pavilion massing near Bharat Mandapam.",
    },
    { wingCount: 3, addAuditorium: true, scale: 1.06 }
  ),
  "mumbai-metro-line-2a": metroModel({ title: "Metro viaduct interchange", family: "metro", summary: "Elevated two-track interchange massing for the Dahisar East to DN Nagar corridor." }, { viaductLength: 5.8, stationWidth: 2.25, trainCars: 4, supportCount: 4, addConcourse: true }),
  "mumbai-metro-line-7": metroModel({ title: "North-south elevated metro", family: "metro", summary: "Linear elevated station massing with longer train formation." }, { viaductLength: 5.9, stationWidth: 2.15, trainCars: 4, supportCount: 4 }),
  "malad-stp": wastewaterModel({ title: "Sewage treatment process train", family: "wastewater", summary: "Clarifier and processing tank layout for the Malad plant." }, { tankCount: 3, addDigesters: true }),
  "bhandup-stp": wastewaterModel({ title: "Expanded wastewater node", family: "wastewater", summary: "Saved 3D treatment cluster with digesters and process tanks." }, { tankCount: 4, addDigesters: true, scale: 1.08 }),
  "bhandup-multispeciality-hospital": hospitalModel({ title: "Multispeciality hospital campus", family: "hospital", summary: "Twin-wing municipal hospital massing with helipad-ready roof deck." }, { helipad: true }),
  "csmt-redevelopment": railStationModel({ title: "Heritage terminus redevelopment", family: "station", summary: "Redevelopment concept with concourse bridge and heritage domes." }, { heritageDome: true, multimodalWing: true, scale: 1.08 }),
  "visakhapatnam-railway-station-redevelopment": railStationModel({ title: "Coastal city station upgrade", family: "station", summary: "Modern station redevelopment with multimodal entry hall." }, { multimodalWing: true }),
  "visakhapatnam-fishing-harbour-modernisation": portModel({ title: "Fishing harbour modernisation", family: "port", summary: "Modernised berth and crane layout for harbour operations." }, { craneCount: 3 }),
  "raipur-visakhapatnam-economic-corridor-ap-section": corridorModel({ title: "Economic corridor segment", family: "highway", summary: "Freight corridor section with grade-separated ramps." }, { rampCount: 2, viaduct: true }),
  "convent-junction-sheela-nagar-port-road": corridorModel({ title: "Port access road", family: "road", summary: "Urban freight road with access ramps near the port belt." }, { rampCount: 1 }),
  "narasannapeta-pathapatnam-nh326a": corridorModel({ title: "Highway corridor section", family: "highway", summary: "Four-lane highway segment massing with support piers." }, { viaduct: true, rampCount: 1 }),
  "howrah-maidan-esplanade-metro": metroModel({ title: "River-crossing metro section", family: "metro", summary: "Underground metro section with deep-tube alignment concept." }, { undergroundTube: true, viaductLength: 5.1, trainCars: 3, stationWidth: 1.95 }),
  "kavi-subhash-hemanta-mukhopadhyay-metro": metroModel({ title: "Terminal metro extension", family: "metro", summary: "Saved metro terminal section with concourse box and elevated deck." }, { trainCars: 3, addConcourse: true, supportCount: 3 }),
  "taratala-majerhat-metro": metroModel({ title: "Connector metro station", family: "metro", summary: "Short elevated connector station model for Taratala to Majerhat." }, { viaductLength: 5.2, stationWidth: 2, trainCars: 2, addConcourse: true }),
  "pune-metro-ruby-hall-ramwadi": metroModel({ title: "Urban metro eastward stretch", family: "metro", summary: "Longer station canopy with four-car metro preview." }, { viaductLength: 6.1, stationWidth: 2.2, trainCars: 4, supportCount: 4 }),
  "kochi-metro-phase-1b-tripunithura": metroModel({ title: "Metro phase extension", family: "metro", summary: "Saved elevated metro extension model with concourse and viaduct spans." }, { viaductLength: 5.6, stationWidth: 2.05, trainCars: 3, addConcourse: true }),
  "agra-metro-taj-east-gate-mankameshwar": metroModel({ title: "Heritage city metro line", family: "metro", summary: "Compact metro section for the Agra corridor with protected canopy form." }, { undergroundTube: true, viaductLength: 4.9, stationWidth: 1.9, trainCars: 3 }),
  "duhai-modinagar-north-rrts": rrtsModel({ title: "Regional rapid transit section", family: "rrts", summary: "Saved RRTS viaduct with twin trainsets and portal edge." }, { addPortal: true }),
  "pune-metro-pimpri-nigdi-extension": metroModel({ title: "Metro extension viaduct", family: "metro", summary: "Northern Pune extension with long viaduct deck and four-car train." }, { viaductLength: 6.2, stationWidth: 2.15, trainCars: 4, supportCount: 4 }),
  "gurugram-metro-rail-project": metroModel({ title: "City loop metro project", family: "metro", summary: "Saved metro loop concept with interchange concourse and deck." }, { viaductLength: 6, stationWidth: 2.3, trainCars: 4, supportCount: 5, addConcourse: true }),
  "aiims-rewari": hospitalModel({ title: "AIIMS medical campus", family: "hospital", summary: "Institutional hospital massing with helipad and campus-scale wings." }, { helipad: true, scale: 1.08 }),
  "rewari-kathuwas-rail-doubling": railLineModel({ title: "Rail doubling section", family: "railway", summary: "Twin-track doubling model with trainset and overbridge." }, { trackCount: 2, trainCount: 1, addOverbridge: true }),
  "kathuwas-narnaul-rail-doubling": railLineModel({ title: "Rail capacity upgrade", family: "railway", summary: "Parallel rail line doubling with expanded overbridge span." }, { trackCount: 2, trainCount: 2, addOverbridge: true, scale: 1.05 }),
  "bhiwani-dobh-bhali-rail-doubling": railLineModel({ title: "Rail corridor strengthening", family: "railway", summary: "Saved double-track corridor with longer track bed and service span." }, { trackCount: 2, trainCount: 1 }),
  "rohtak-meham-hansi-rail-line": railLineModel({ title: "New rail line package", family: "railway", summary: "New corridor rail model with future expansion track bed." }, { trackCount: 1, trainCount: 1, addOverbridge: true }),
  "aiims-jodhpur-trauma-centre": hospitalModel({ title: "Trauma and critical care block", family: "hospital", summary: "Saved trauma-centre massing with tower block and emergency forecourt." }, { traumaTower: true, helipad: true }),
  "jodhpur-airport-terminal": airportModel({ title: "Airport terminal building", family: "airport", summary: "Terminal slice with runway edge, ATC tower, and aircraft stand." }, { addJetBridge: true }),
  "jodhpur-ring-road-karwar-dangiyawas": corridorModel({ title: "Ring road section", family: "road", summary: "Ring road carriageway with grade-separated ramps." }, { rampCount: 2, viaduct: true, bridgeArch: true }),
  "pachpadra-bagundi-nh25": corridorModel({ title: "Desert highway section", family: "highway", summary: "Highway massing with elevated support structure and clean divider." }, { viaduct: true, rampCount: 1 }),
  "iim-shillong-umsawli-campus": campusModel({ title: "Academic campus cluster", family: "education", summary: "Saved campus massing with radial academic wings and auditorium." }, { wingCount: 4, addAuditorium: true }),
  "shillong-diengpasoh-road": corridorModel({ title: "Hill road corridor", family: "road", summary: "Hill road section with curved access ramps and compact deck." }, { rampCount: 2, bridgeArch: true, scale: 1.01 }),
};

function fallbackModel(project) {
  const type = String(project?.type || "infrastructure").toLowerCase();

  if (type.includes("metro")) {
    return metroModel({ title: "Metro corridor", family: "metro", summary: "Fallback elevated metro massing." });
  }
  if (type.includes("hospital")) {
    return hospitalModel({ title: "Healthcare complex", family: "hospital", summary: "Fallback hospital massing." });
  }
  if (type.includes("rail")) {
    return railLineModel({ title: "Rail corridor", family: "railway", summary: "Fallback rail model." });
  }
  if (type.includes("road") || type.includes("highway")) {
    return corridorModel({ title: "Road corridor", family: "road", summary: "Fallback road corridor model." });
  }
  if (type.includes("airport")) {
    return airportModel({ title: "Airport terminal", family: "airport", summary: "Fallback airport model." });
  }
  if (type.includes("port")) {
    return portModel({ title: "Harbour node", family: "port", summary: "Fallback harbour model." });
  }
  if (type.includes("wastewater")) {
    return wastewaterModel({ title: "Treatment plant", family: "wastewater", summary: "Fallback wastewater facility." });
  }
  if (type.includes("education")) {
    return campusModel({ title: "Campus complex", family: "education", summary: "Fallback campus model." });
  }

  return modelBase(
    { title: project?.name || "Civic structure", family: "civic", summary: "Fallback civic structure massing." },
    [
      box("dark", [0, -0.92, 0], [6, 0.18, 6]),
      box("neutral", [0, -0.1, 0], [1.8, 1.4, 1.8]),
      cone("accent", [0, 1.12, 0], 0.72, 0.8, { radialSegments: 6 }),
      torus("secondary", [0, -0.35, 0], 1.4, 0.06, { rotation: [Math.PI / 2, 0, 0] }),
    ]
  );
}

export function getProjectModelSpec(project) {
  if (!project) {
    return fallbackModel(null);
  }

  return savedProjectModels[project.id] || fallbackModel(project);
}

export const projectModelCatalog = savedProjectModels;
