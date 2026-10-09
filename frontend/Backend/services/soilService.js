const https = require("https");

const regionalSoilProfiles = {
  // Rajasthan
  Jaipur: "Sandy loam (regional estimate)",
  Sikar: "Sandy soil (regional estimate)",
  Ajmer: "Sandy loam (regional estimate)",
  Alwar: "Alluvial loam (regional estimate)",
  Kota: "Black soil (regional estimate)",
  Jodhpur: "Sandy soil (regional estimate)",
  Bikaner: "Sandy soil (regional estimate)",
  Udaipur: "Mixed red and black soil (regional estimate)",
  Bhilwara: "Black soil (regional estimate)",
  Bharatpur: "Alluvial loam (regional estimate)",
  // Madhya Pradesh
  Indore: "Black soil (regional estimate)",
  Bhopal: "Black soil (regional estimate)",
  Ujjain: "Black soil (regional estimate)",
  Gwalior: "Alluvial loam (regional estimate)",
  Jabalpur: "Black soil (regional estimate)",
  Sagar: "Black soil (regional estimate)",
  Rewa: "Mixed red and yellow soil (regional estimate)",
  Satna: "Mixed red and yellow soil (regional estimate)",
  // Maharashtra
  Pune: "Black soil (regional estimate)",
  Nashik: "Black soil (regional estimate)",
  Nagpur: "Black soil (regional estimate)",
  Aurangabad: "Black soil (regional estimate)",
  Ahmednagar: "Black soil (regional estimate)",
  Solapur: "Black soil (regional estimate)",
  Kolhapur: "Lateritic soil (regional estimate)",
  Sangli: "Black soil (regional estimate)",
  // Gujarat
  Ahmedabad: "Alluvial loam (regional estimate)",
  Rajkot: "Black soil (regional estimate)",
  Surat: "Alluvial loam (regional estimate)",
  Vadodara: "Alluvial loam (regional estimate)",
  Bhavnagar: "Black soil (regional estimate)",
  Junagadh: "Black soil (regional estimate)",
  // Uttar Pradesh
  Lucknow: "Alluvial loam (regional estimate)",
  Agra: "Alluvial loam (regional estimate)",
  Kanpur: "Alluvial loam (regional estimate)",
  Varanasi: "Alluvial loam (regional estimate)",
  Prayagraj: "Alluvial loam (regional estimate)",
  Meerut: "Alluvial loam (regional estimate)",
  Gorakhpur: "Alluvial loam (regional estimate)",
  Bareilly: "Alluvial loam (regional estimate)",
  // Haryana
  Gurugram: "Alluvial loam (regional estimate)",
  Hisar: "Sandy loam (regional estimate)",
  Rohtak: "Alluvial loam (regional estimate)",
  Panipat: "Alluvial loam (regional estimate)",
  Karnal: "Alluvial loam (regional estimate)",
  Ambala: "Alluvial loam (regional estimate)",
  // Punjab
  Ludhiana: "Alluvial loam (regional estimate)",
  Amritsar: "Alluvial loam (regional estimate)",
  Jalandhar: "Alluvial loam (regional estimate)",
  Patiala: "Alluvial loam (regional estimate)",
  // Bihar
  Patna: "Alluvial loam (regional estimate)",
  Gaya: "Alluvial loam (regional estimate)",
  Muzaffarpur: "Alluvial loam (regional estimate)",
  Bhagalpur: "Alluvial loam (regional estimate)",
  // West Bengal
  Kolkata: "Alluvial loam (regional estimate)",
  Bardhaman: "Alluvial loam (regional estimate)",
  Murshidabad: "Alluvial loam (regional estimate)",
  Nadia: "Alluvial loam (regional estimate)",
  // Odisha
  Cuttack: "Alluvial loam (regional estimate)",
  Puri: "Alluvial loam (regional estimate)",
  Sambalpur: "Red and yellow soil (regional estimate)",
  // Andhra Pradesh
  Vijayawada: "Alluvial loam (regional estimate)",
  Visakhapatnam: "Red soil (regional estimate)",
  Guntur: "Black soil (regional estimate)",
  // Telangana
  Hyderabad: "Red soil (regional estimate)",
  Warangal: "Red soil (regional estimate)",
  Karimnagar: "Red soil (regional estimate)",
  // Karnataka
  Bengaluru: "Red soil (regional estimate)",
  Mysuru: "Red soil (regional estimate)",
  Belagavi: "Black soil (regional estimate)",
  // Tamil Nadu
  Chennai: "Alluvial loam (regional estimate)",
  Coimbatore: "Red soil (regional estimate)",
  Madurai: "Red soil (regional estimate)",
  // Kerala
  Thiruvananthapuram: "Lateritic soil (regional estimate)",
  Ernakulam: "Alluvial loam (regional estimate)",
  // Chhattisgarh
  Raipur: "Red and yellow soil (regional estimate)",
  Bilaspur: "Red and yellow soil (regional estimate)",
  // Jharkhand
  Ranchi: "Red and yellow soil (regional estimate)",
  Dhanbad: "Red and yellow soil (regional estimate)",
  // Assam
  Guwahati: "Alluvial loam (regional estimate)",
  Dibrugarh: "Alluvial loam (regional estimate)",
};

const stateSoilProfiles = {
  Rajasthan: "Sandy loam (state-level estimate)",
  "Madhya Pradesh": "Black soil (state-level estimate)",
  Maharashtra: "Black soil (state-level estimate)",
  Gujarat: "Alluvial and black soils (state-level estimate)",
  "Uttar Pradesh": "Alluvial soil (state-level estimate)",
  Haryana: "Alluvial soil (state-level estimate)",
  Punjab: "Alluvial soil (state-level estimate)",
  Bihar: "Alluvial soil (state-level estimate)",
  "West Bengal": "Alluvial soil (state-level estimate)",
  Odisha: "Alluvial and red soils (state-level estimate)",
  "Andhra Pradesh": "Red and alluvial soils (state-level estimate)",
  Telangana: "Red soil (state-level estimate)",
  Karnataka: "Red and black soils (state-level estimate)",
  "Tamil Nadu": "Red and alluvial soils (state-level estimate)",
  Kerala: "Lateritic soil (state-level estimate)",
  Chhattisgarh: "Red and yellow soils (state-level estimate)",
  Jharkhand: "Red and yellow soils (state-level estimate)",
  Assam: "Alluvial soil (state-level estimate)",
  "Himachal Pradesh": "Mountain soil (state-level estimate)",
  Uttarakhand: "Mountain soil (state-level estimate)",
};

const typicalSoilRanges = {
  sandy: { ph: "7.0-8.5", clay: "5-15%", sand: "70-90%" },
  "sandy loam": { ph: "6.0-8.0", clay: "10-20%", sand: "60-80%" },
  alluvial: { ph: "6.5-8.0", clay: "15-30%", sand: "30-55%" },
  black: { ph: "7.0-8.5", clay: "35-60%", sand: "10-30%" },
  mixed: { ph: "6.5-8.5", clay: "15-60%", sand: "10-55%" },
};

const fetchSoilProperties = (latitude, longitude) =>
  new Promise((resolve, reject) => {
    const query = new URLSearchParams({
      lon: String(longitude),
      lat: String(latitude),
      depth: "0-5cm",
      value: "mean",
    });
    ["clay", "sand", "silt", "phh2o"].forEach((property) =>
      query.append("property", property)
    );

    const request = https.get(
      `https://rest.isric.org/soilgrids/v2.0/properties/query?${query}`,
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            reject(
              new Error(
                `Soil data service returned status ${response.statusCode}`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(data));
          } catch {
            reject(
              new Error("Soil data service returned invalid JSON")
            );
          }
        });
      }
    );

    request.setTimeout(8000, () => {
      request.destroy();
      reject(new Error("Soil data service request timed out"));
    });

    request.on("error", reject);
  });

const readProperty = (layers, name) => {
  const layer = layers.find((item) => item.name === name);
  const rawValue = layer?.depths?.[0]?.values?.mean;

  if (rawValue == null || !Number.isFinite(Number(rawValue))) {
    return null;
  }

  return Number(
    (Number(rawValue) / (layer.unit_measure?.d_factor || 1)).toFixed(1)
  );
};

const getSoilData = async (
  latitude,
  longitude,
  samplePoints = [],
  regionPoints = [],
  location = ""
) => {
  const pointsToQuery = [
    { lat: latitude, lng: longitude },
    ...[
      regionPoints[0],
      regionPoints[Math.floor(regionPoints.length / 2)],
      regionPoints[regionPoints.length - 1],
    ].filter(Boolean),
    ...[
      samplePoints[0],
      samplePoints[Math.floor(samplePoints.length / 2)],
      samplePoints[samplePoints.length - 1],
    ].filter(Boolean),
  ].filter(
    (point, index, points) =>
      points.findIndex(
        (candidate) =>
          Number(candidate.lat) === Number(point.lat) &&
          Number(candidate.lng) === Number(point.lng)
      ) === index
  ).slice(0, 3);

  const soilSamples = [];
  const responses = await Promise.allSettled(
    pointsToQuery.map((point) =>
      fetchSoilProperties(point.lat, point.lng)
    )
  );

  responses.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `Soil data unavailable at region sample ${index + 1}:`,
        result.reason.message
      );
      return;
    }

    const layers = result.value?.properties?.layers;

    if (!Array.isArray(layers)) {
      console.warn(
        `Soil data service returned an invalid response at region sample ${index + 1}`
      );
      return;
    }

    const sample = {
      clay: readProperty(layers, "clay"),
      sand: readProperty(layers, "sand"),
      silt: readProperty(layers, "silt"),
      ph: readProperty(layers, "phh2o"),
    };

    if (sample.clay != null || sample.sand != null) {
      soilSamples.push(sample);
    }
  });

  if (soilSamples.length === 0) {
    const [district, state] = location
      .split(",")
      .map((part) => part.trim());
    const regionalSoilType =
      regionalSoilProfiles[district] ||
      stateSoilProfiles[state] ||
      "Regional soil estimate unavailable";
    const profileName = regionalSoilType.toLowerCase();
    const profileKey = profileName.includes("alluvial and black")
      ? "mixed"
      : profileName.includes("black")
        ? "black"
        : profileName.includes("sandy loam")
          ? "sandy loam"
          : profileName.includes("sandy")
            ? "sandy"
            : profileName.includes("alluvial")
              ? "alluvial"
              : null;
    const ranges = profileKey
      ? typicalSoilRanges[profileKey]
      : null;

    console.warn(
      `SoilGrids unavailable; using regional soil profile for ${location}.`
    );

    return {
      soilType: regionalSoilType,
      ph: null,
      clay: null,
      sand: null,
      silt: null,
      phRange: ranges?.ph || null,
      clayRange: ranges?.clay || null,
      sandRange: ranges?.sand || null,
      source: "Regional profile estimate",
      samplePointCount: 0,
      dataAvailable: false,
      regionalEstimate: regionalSoilType !==
        "Regional soil estimate unavailable",
    };
  }

  const averageProperty = (property) => {
    const values = soilSamples
      .map((sample) => sample[property])
      .filter((value) => value != null);

    return values.length > 0
      ? Number(
          (
            values.reduce((total, value) => total + value, 0) /
            values.length
          ).toFixed(1)
        )
      : null;
  };

  const clay = averageProperty("clay");
  const sand = averageProperty("sand");

  const soilType =
    clay != null && clay >= 40
      ? "Clay-rich"
      : sand != null && sand >= 70
        ? "Sandy"
        : "Loamy";

  return {
    soilType,
    ph: averageProperty("ph"),
    clay,
    sand: averageProperty("sand"),
    silt: averageProperty("silt"),
    source: "SoilGrids",
    samplePointCount: soilSamples.length,
    dataAvailable: true,
  };
};

module.exports = {
  getSoilData,
};