// Persistent feedback utilities using localStorage

export const saveFeedback = (data) => {
  const existing = JSON.parse(localStorage.getItem("hle_feedbacks")) || [];
  existing.push(data);
  localStorage.setItem("hle_feedbacks", JSON.stringify(existing));
};

export const getFeedback = () => {
  return JSON.parse(localStorage.getItem("hle_feedbacks")) || [];
};

export const getFeedbackByProject = (projectId) => {
  return getFeedback().filter((f) => f.projectId === projectId);
};

export const getAverageRating = (projectId) => {
  const feedbacks = getFeedbackByProject(projectId);
  if (feedbacks.length === 0) return null;
  const total = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
  return (total / feedbacks.length).toFixed(1);
};
