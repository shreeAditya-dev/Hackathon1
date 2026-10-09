const generateRecommendation = ({
  crop,
  probability,
  weather,
  soil,
  monsoon,
}) => {
  let status;
  let recommendation;

  if (probability >= 75) {
    status = "Highly Suitable";

    recommendation = `${crop} sowing conditions are highly suitable based on the current weather, soil, and monsoon conditions.`;
  } else if (probability >= 50) {
    status = "Moderately Suitable";

    recommendation = `${crop} sowing is moderately suitable. Monitor weather and soil conditions before sowing.`;
  } else {
    status = "Not Suitable";

    recommendation = `${crop} sowing conditions are currently not suitable. Consider waiting for better conditions.`;
  }

  if (soil.dataAvailable === false) {
    recommendation +=
      " Soil texture data could not be retrieved for this region, so the outlook is based on weather and modelled soil moisture only.";
  }

  return {
    status,

    recommendation,

    factors: {
      temperature:
        weather.temperature,

      rainfall:
        weather.rainfall,

      humidity:
        weather.humidity,

      soilPH:
        soil.ph,

      monsoonStatus:
        monsoon.monsoonStatus,
    },
  };
};

module.exports = {
  generateRecommendation,
};