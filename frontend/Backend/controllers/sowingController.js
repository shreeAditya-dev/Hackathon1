const {
  getWeatherData,
} = require("../services/weatherService");

const {
  getSoilData,
} = require("../services/soilService");

const {
  getMonsoonData,
} = require("../services/monsoonService");

const {
  generateRecommendation,
} = require("../services/aiService");

const {
  calculateSowingProbability,
} = require("../utils/probability");

const analyzeSowing = async (req, res) => {
  try {
    const {
      crop,
      location,
      region,
    } = req.body;

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop is required",
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    if (
      !Array.isArray(region) ||
      region.length < 3 ||
      !region.every(
        (point) =>
          point &&
          Number.isFinite(Number(point?.lat)) &&
          Number.isFinite(Number(point?.lng)) &&
          Number(point.lat) >= -90 &&
          Number(point.lat) <= 90 &&
          Number(point.lng) >= -180 &&
          Number(point.lng) <= 180
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid polygon region with at least 3 points is required",
      });
    }

    const latitude =
      region.reduce((sum, point) => sum + Number(point.lat), 0) /
      region.length;
    const longitude =
      region.reduce((sum, point) => sum + Number(point.lng), 0) /
      region.length;

    const [weather, monsoon] = await Promise.all([
      getWeatherData(location, region),
      getMonsoonData(location),
    ]);
    const soil = await getSoilData(
      latitude,
      longitude,
      weather.samplePoints,
      region,
      location
    );

    const probability =
      calculateSowingProbability({
        weather,
        soil,
        monsoon,
      });

    const recommendation =
      generateRecommendation({
        crop,
        probability,
        weather,
        soil,
        monsoon,
      });

    res.json({
      success: true,

      message:
        "Area-level sowing analysis completed",

      data: {
        crop,

        location,

        soilType: soil.soilType,

        region,

        probability,

        recommendation,

        weather,

        soil,

        monsoon,
      },
    });
  } catch (error) {
    console.error(
      "Sowing Controller Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to complete sowing analysis",
    });
  }
};

module.exports = {
  analyzeSowing,
};