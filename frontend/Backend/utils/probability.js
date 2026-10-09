const calculateSowingProbability = ({
  weather,
  soil,
}) => {
  let score = 0;

  const forecastRainfall = (
    weather.rainfallForecast || []
  ).reduce(
    (total, day) => total + Number(day.rainfall || 0),
    0
  );

  if (forecastRainfall >= 25) {
    score += 25;
  } else if (forecastRainfall >= 10) {
    score += 15;
  } else if (forecastRainfall > 0) {
    score += 10;
  }

  if (
    weather.temperature >= 20 &&
    weather.temperature <= 35
  ) {
    score += 25;
  }

  if (weather.humidity >= 50) {
    score += 15;
  }

  if (
    soil.ph != null &&
    soil.ph >= 6 &&
    soil.ph <= 8
  ) {
    score += 15;
  }

  if (weather.soilMoisture >= 15 && weather.soilMoisture <= 40) {
    score += 20;
  } else if (weather.soilMoisture >= 8) {
    score += 10;
  }

  return score;
};

module.exports = {
  calculateSowingProbability,
};