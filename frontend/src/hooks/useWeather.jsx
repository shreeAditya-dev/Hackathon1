import { useEffect, useState } from "react";
import api from "../services/api";

function useWeather(location) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/weather", {
          params: {
            location,
          },
        });

        setWeather(response.data);
      } catch (err) {
        setError("Unable to fetch weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return {
    weather,
    loading,
    error,
  };
}

export default useWeather;