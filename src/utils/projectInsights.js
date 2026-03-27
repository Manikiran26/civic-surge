function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(31, hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function jitter(base, seed, range = 8) {
  const delta = (seed % (range * 2 + 1)) - range;
  return clamp(base + delta, 0, 100);
}

export function getProjectInterestTags(project) {
  const type = String(project?.type || "").toLowerCase();
  if (type.includes("road") || type.includes("highway") || type.includes("metro")) {
    return ["driver", "commuter"];
  }
  if (type.includes("hospital")) {
    return ["health", "family"];
  }
  if (type.includes("education")) {
    return ["student", "family"];
  }
  if (type.includes("rail")) {
    return ["commuter", "driver"];
  }
  if (type.includes("airport") || type.includes("port")) {
    return ["business", "traveler"];
  }
  return ["community"];
}

export function getProjectIntelligence(project) {
  const seed = hashString(project?.id || project?.name);
  const progress = Number(project?.completionPercent ?? project?.completion_percent ?? 0);
  const liveProgress = jitter(progress, seed, 6);

  const now = new Date();
  const start = project?.timeline?.startDate ? new Date(project.timeline.startDate) : null;
  const end = project?.timeline?.endDate ? new Date(project.timeline.endDate) : null;
  let expected = 0;
  if (start && end && end > start) {
    const total = end.getTime() - start.getTime();
    const elapsed = clamp(now.getTime() - start.getTime(), 0, total);
    expected = Math.round((elapsed / total) * 100);
  }
  const deviation = liveProgress - expected;
  const timelineStatus =
    deviation > 8 ? "ahead" : deviation < -8 ? "delayed" : "on-track";

  const budget = Number(project?.budgetCrore ?? project?.budget_inr_crore ?? 1000);
  const actualSpend = Math.round(budget * (0.85 + (seed % 40) / 100));

  const contractors = [
    "Larsen & Toubro Infra",
    "NCC Urban",
    "Tata Projects",
    "Afcons Infrastructure",
    "IRCON International",
  ];
  const agencies = [
    project?.agency,
    "MoHUA",
    "DMRC",
    "NHAI",
    "NBCC",
    "State Infra Dept.",
  ].filter(Boolean);

  return {
    liveProgress,
    expectedProgress: expected,
    deviation,
    timelineStatus,
    budgetPlanned: budget,
    budgetActual: actualSpend,
    contractor: contractors[seed % contractors.length],
    agency: agencies[seed % agencies.length],
  };
}

export function getImpactScores(project) {
  const seed = hashString(project?.id || project?.name);
  const progress = Number(project?.completionPercent ?? 0);
  const economic = clamp(55 + (seed % 45) + Math.floor(progress / 5), 0, 100);
  const traffic = clamp(45 + (seed % 35) + Math.floor(progress / 6), 0, 100);
  const environment = clamp(40 + (seed % 30) + Math.floor(progress / 8), 0, 100);
  const jobsCreated = 120 + (seed % 480);
  return {
    economic,
    traffic,
    environment,
    jobsCreated,
  };
}

export function getCivicExplainer(project, language = "en") {
  const name = project?.name || "This project";
  const timeSaved = project?.impact?.timeSaved || "10 mins";
  const population = project?.impact?.population || "local residents";
  const status = project?.statusLabel || project?.status || "ongoing";

  if (language === "hi") {
    return `${name} आपके रोज़ाना के सफर में लगभग ${timeSaved} की बचत कर सकता है। यह परियोजना ${population} को लाभ पहुँचाती है और फिलहाल ${status} स्थिति में है।`;
  }
  if (language === "te") {
    return `${name} మీ రోజువారీ ప్రయాణంలో సుమారు ${timeSaved} సమయాన్ని ఆదా చేయడంలో సహాయపడుతుంది. ఇది ${population}కి ప్రయోజనాన్ని ఇస్తుంది మరియు ప్రస్తుతం ${status} స్థితిలో ఉంది.`;
  }
  if (language === "kn") {
    return `${name} ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಪ್ರಯಾಣದಲ್ಲಿ ಸುಮಾರು ${timeSaved} ಸಮಯವನ್ನು ಉಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ${population}ಗೆ ಲಾಭ ನೀಡುತ್ತದೆ ಮತ್ತು ಈಗ ${status} ಸ್ಥಿತಿಯಲ್ಲಿದೆ.`;
  }
  if (language === "mr") {
    return `${name} तुमच्या दैनंदिन प्रवासात सुमारे ${timeSaved} वेळ वाचवू शकते. हे प्रकल्प ${population}साठी उपयुक्त आहे आणि सध्या ${status} स्थितीत आहे.`;
  }
  if (language === "bn") {
    return `${name} আপনার দৈনন্দিন যাত্রায় প্রায় ${timeSaved} সময় সাশ্রয় করতে পারে। এটি ${population} উপকার করে এবং বর্তমানে ${status} অবস্থায় আছে।`;
  }
  if (language === "ta") {
    return `${name} தினசரி பயணத்தில் சுமார் ${timeSaved} நேரத்தை சேமிக்க உதவும். இது ${population} மக்களுக்கு பயன் தருகிறது மற்றும் தற்போது ${status} நிலையில் உள்ளது.`;
  }

  return `${name} can reduce daily travel by about ${timeSaved}. It benefits ${population} and is currently ${status}.`;
}
