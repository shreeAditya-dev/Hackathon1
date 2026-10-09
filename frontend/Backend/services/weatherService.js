const https = require("https");

const httpsGetJson = (url) => {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
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
                `API request failed with status ${response.statusCode}`
              )
            );

            return;
          }

          try {
            const json = JSON.parse(data);

            resolve(json);
          } catch (error) {
            reject(
              new Error(
                "Invalid JSON response from weather API"
              )
            );
          }
        });
      }
    );

    request.setTimeout(15000, () => {
      request.destroy();

      reject(
        new Error(
          "Weather API request timed out"
        )
      );
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
};

/*
  Check whether a latitude/longitude point
  is inside the selected polygon.
*/
const isPointInsidePolygon = (
  point,
  polygon
) => {
  const x = point.lng;
  const y = point.lat;

  let inside = false;

  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;

    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y &&
      x <
        ((xj - xi) * (y - yi)) /
          (yj - yi) +
          xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

/*
  Calculate polygon bounding box.
*/
const getBoundingBox = (polygon) => {
  const latitudes = polygon.map(
    (point) => Number(point.lat)
  );

  const longitudes = polygon.map(
    (point) => Number(point.lng)
  );

  return {
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
  };
};

/*
  Generate representative points
  inside the selected polygon.
*/
const generateSamplePoints = (
  polygon
) => {
  const box = getBoundingBox(polygon);

  const points = [];

  const gridSize = 5;

  const latStep =
    (box.maxLat - box.minLat) /
    (gridSize - 1 || 1);

  const lngStep =
    (box.maxLng - box.minLng) /
    (gridSize - 1 || 1);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat =
        box.minLat + latStep * i;

      const lng =
        box.minLng + lngStep * j;

      const point = {
        lat,
        lng,
      };

      if (
        isPointInsidePolygon(
          point,
          polygon
        )
      ) {
        points.push(point);
      }
    }
  }

  /*
    If polygon is very small and no grid
    point falls inside it, use the average
    of polygon vertices.
  */
  if (points.length === 0) {
    const avgLat =
      polygon.reduce(
        (sum, point) =>
          sum + Number(point.lat),
        0
      ) / polygon.length;

    const avgLng =
      polygon.reduce(
        (sum, point) =>
          sum + Number(point.lng),
        0
      ) / polygon.length;

    points.push({
      lat: avgLat,
      lng: avgLng,
    });
  }

  /*
    Maximum 9 sample points to keep
    API requests/data reasonable.
  */
  const sampleCount = Math.min(points.length, 9);

  return Array.from({ length: sampleCount }, (_, index) => {
    const pointIndex = Math.round(
      (index * (points.length - 1)) /
        (sampleCount - 1 || 1)
    );

    return points[pointIndex];
  });
};

/*
  Average helper.
*/
const average = (values) => {
  const validValues = values
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return 0;
  }

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / validValues.length;
};

/*
  Get weather for multiple points.
*/
const getWeatherForPoints = async (
  points
) => {
  const latitude = points
    .map((point) => point.lat)
    .join(",");

  const longitude = points
    .map((point) => point.lng)
    .join(",");

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
    `&hourly=soil_moisture_0_to_7cm` +
    `&forecast_hours=24` +
    `&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=14` +
    `&timezone=auto`;

  const response =
    await httpsGetJson(weatherUrl);

  if (Array.isArray(response)) {
    return response;
  }

  return [response];
};

/*
  Aggregate current weather.
*/
const aggregateCurrentWeather = (
  weatherResults
) => {
  const temperatures = [];
  const humidities = [];
  const rainfalls = [];
  const windSpeeds = [];
  const soilMoistureValues = [];

  weatherResults.forEach((item) => {
    if (!item?.current) {
      return;
    }

    temperatures.push(
      item.current.temperature_2m
    );

    humidities.push(
      item.current.relative_humidity_2m
    );

    rainfalls.push(
      item.current.precipitation
    );

    windSpeeds.push(
      item.current.wind_speed_10m
    );

    const hourly = item.hourly;
    const currentTime = new Date(item.current.time).getTime();

    if (
      !hourly?.time ||
      !hourly.soil_moisture_0_to_7cm ||
      !Number.isFinite(currentTime)
    ) {
      return;
    }

    let closestIndex = -1;
    let closestDifference = Infinity;

    hourly.time.forEach((time, index) => {
      const difference = Math.abs(
        new Date(time).getTime() - currentTime
      );

      if (difference < closestDifference) {
        closestDifference = difference;
        closestIndex = index;
      }
    });

    const moisture =
      hourly.soil_moisture_0_to_7cm[closestIndex];

    if (Number.isFinite(Number(moisture))) {
      soilMoistureValues.push(Number(moisture) * 100);
    }
  });

  if (soilMoistureValues.length === 0) {
    throw new Error(
      "Surface soil moisture is unavailable for the selected region"
    );
  }

  return {
    temperature: Number(
      average(temperatures).toFixed(1)
    ),

    humidity: Number(
      average(humidities).toFixed(1)
    ),

    rainfall: Number(
      average(rainfalls).toFixed(1)
    ),

    windSpeed: Number(
      average(windSpeeds).toFixed(1)
    ),

    soilMoisture: Number(
      average(soilMoistureValues).toFixed(1)
    ),
  };
};

/*
  Aggregate 14-day forecast.
*/
const aggregateRainfallForecast = (
  weatherResults
) => {
  if (
    !weatherResults ||
    weatherResults.length === 0
  ) {
    return [];
  }

  const firstDaily =
    weatherResults.find(
      (item) => item?.daily?.time
    )?.daily;

  if (!firstDaily) {
    return [];
  }

  const dates = firstDaily.time || [];

  const forecast = [];

  for (
    let dayIndex = 0;
    dayIndex < dates.length;
    dayIndex++
  ) {
    const rainfallValues = [];
    const rainProbabilityValues = [];
    const maxTemperatureValues = [];
    const minTemperatureValues = [];

    weatherResults.forEach((item) => {
      const daily = item?.daily;

      if (!daily) {
        return;
      }

      if (
        daily.precipitation_sum?.[
          dayIndex
        ] !== undefined
      ) {
        rainfallValues.push(
          daily.precipitation_sum[
            dayIndex
          ]
        );
      }

      if (
        daily
          .precipitation_probability_max?.[
          dayIndex
        ] !== undefined
      ) {
        rainProbabilityValues.push(
          daily
            .precipitation_probability_max[
            dayIndex
          ]
        );
      }

      if (
        daily.temperature_2m_max?.[
          dayIndex
        ] !== undefined
      ) {
        maxTemperatureValues.push(
          daily.temperature_2m_max[
            dayIndex
          ]
        );
      }

      if (
        daily.temperature_2m_min?.[
          dayIndex
        ] !== undefined
      ) {
        minTemperatureValues.push(
          daily.temperature_2m_min[
            dayIndex
          ]
        );
      }
    });

    forecast.push({
      date: dates[dayIndex],

      rainfall: Number(
        average(
          rainfallValues
        ).toFixed(1)
      ),

      rainProbability: Number(
        average(
          rainProbabilityValues
        ).toFixed(1)
      ),

      maxTemperature:
        maxTemperatureValues.length > 0
          ? Number(
              average(
                maxTemperatureValues
              ).toFixed(1)
            )
          : null,

      minTemperature:
        minTemperatureValues.length > 0
          ? Number(
              average(
                minTemperatureValues
              ).toFixed(1)
            )
          : null,
    });
  }

  return forecast;
};

const getWeatherData = async (
  location,
  region
) => {
  try {
    if (!location) {
      throw new Error(
        "Location is required"
      );
    }

    if (
      !Array.isArray(region) ||
      region.length < 3
    ) {
      throw new Error(
        "Valid polygon region is required"
      );
    }

    /*
      Generate points inside polygon.
    */
    const samplePoints =
      generateSamplePoints(region);

    console.log(
      "Weather sample points:",
      samplePoints
    );

    /*
      Get weather for all selected-region
      sample points.
    */
    const weatherResults =
      await getWeatherForPoints(
        samplePoints
      );

    if (
      !weatherResults ||
      weatherResults.length === 0
    ) {
      throw new Error(
        "No weather data received"
      );
    }

    /*
      Current area-level weather.
    */
    const currentWeather =
      aggregateCurrentWeather(
        weatherResults
      );

    /*
      14-day area-level rainfall forecast.
    */
    const rainfallForecast =
      aggregateRainfallForecast(
        weatherResults
      );

    /*
      Calculate region center.
    */
    const centerLatitude =
      average(
        region.map(
          (point) => point.lat
        )
      );

    const centerLongitude =
      average(
        region.map(
          (point) => point.lng
        )
      );

    return {
      location,

      center: {
        latitude: Number(
          centerLatitude.toFixed(6)
        ),

        longitude: Number(
          centerLongitude.toFixed(6)
        ),
      },

      region,

      samplePoints,

      samplePointCount:
        samplePoints.length,

      temperature:
        currentWeather.temperature,

      humidity:
        currentWeather.humidity,

      rainfall:
        currentWeather.rainfall,

      windSpeed:
        currentWeather.windSpeed,

      soilMoisture:
        currentWeather.soilMoisture,

      timezone:
        weatherResults[0]?.timezone ||
        "Asia/Kolkata",

      rainfallForecast,
    };
  } catch (error) {
    console.error(
      "Weather Service Error:",
      error.message
    );

    throw new Error(
      `Weather service error: ${error.message}`
    );
  }
};

module.exports = {
  getWeatherData,
};