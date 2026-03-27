export function getProjectName(type) {
  switch (type) {
    case "transport": return "Delhi Metro Phase 4";
    case "healthcare": return "Government Hospital - Sector 18";
    case "education": return "Delhi Smart Public School";
    case "infrastructure": return "City Bridge Project - Yamuna Link";
    default: return "Public Infrastructure Project";
  }
}

export function generateTimeline() {
  const start = 2022 + Math.floor(Math.random() * 3);
  const end = start + 2 + Math.floor(Math.random() * 2);
  return `${start}–${end}`;
}

export function generateProgress() {
  return Math.floor(Math.random() * 60) + 30; // 30–90%
}

export function generateBudget(type) {
  const ranges = {
    healthcare: [300, 900],
    education: [100, 400],
    transport: [500, 2000],
    infrastructure: [200, 800]
  };
  const [min, max] = ranges[type] || [100, 500];
  return `₹${Math.floor(Math.random() * (max - min) + min)} Cr`;
}

const baseProjects = [
  {
    id: "metro_delhi",
    type: "transport",
    category: "transport",
    impact: "Reduces congestion and improves daily commute.",
    citizens: "1.2M+",
    status: "Ongoing",
    agency: "DMRC",
    video: "/videos/metro.mp4",
    lat: 28.6133,
    lng: 77.2420
  },
  {
    id: "aiims_hospital",
    type: "healthcare",
    category: "healthcare",
    impact: "Improves access to advanced healthcare services.",
    citizens: "850K+",
    status: "Planned",
    agency: "Ministry of Health",
    video: "/videos/hospital.mp4",
    lat: 28.5672,
    lng: 77.2100
  },
  {
    id: "smart_school_delhi",
    type: "education",
    category: "education",
    impact: "Digitally-integrated classrooms and modern learning.",
    citizens: "296K+",
    status: "Completed",
    agency: "Public Authority",
    video: "/videos/school.mp4",
    lat: 28.6200,
    lng: 77.2300
  },
  {
    id: "central_bridge",
    type: "infrastructure",
    category: "infrastructure",
    impact: "Improves traffic flow and reduces congestion.",
    citizens: "900K+",
    status: "Ongoing",
    agency: "NHAI",
    video: "/videos/bridge.mp4",
    lat: 28.6300,
    lng: 77.2200
  }
];

export const demoProjects = baseProjects.map(p => {
  const pProg = generateProgress();
  return {
    ...p,
    name: getProjectName(p.type),
    progress: pProg,
    completion: pProg,
    timeline: generateTimeline(),
    budget: generateBudget(p.type),
  };
});
