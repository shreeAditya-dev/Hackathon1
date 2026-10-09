export function calculateSowingScore({
  rainfall = 0,
  soilMoisture = 0,
  historicalOnset = 0,
  cropSuitability = 0,
}) {
  const score =
    rainfall * 0.35 +
    soilMoisture * 0.25 +
    historicalOnset * 0.20 +
    cropSuitability * 0.20;

  return Math.round(score);
}

export function getConfidence(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";

  return "Low";
}

export function getRiskLevel(score) {
  if (score >= 80) return "Favourable";
  if (score >= 60) return "Moderate";

  return "Unfavourable";
}