const getMonsoonData = async (location) => {
  try {
    return {
      location,
      expectedRainfall: 650,
      monsoonStart: "June",
      monsoonStatus: "Normal",
    };
  } catch (error) {
    throw new Error("Unable to fetch monsoon data");
  }
};

module.exports = {
  getMonsoonData,
};