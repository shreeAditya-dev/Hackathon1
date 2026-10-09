import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const analyzeSowing = async (data) => {
  const response = await api.post("/sowing/analyze", data);
  return response.data;
};

export const getWeather = async (lat, lon, location) => {
  const response = await api.get("/weather", { params: { lat, lon, location } });
  return response.data;
};

export const getCrops = async () => {
  const response = await api.get("/crops");
  return response.data;
};

export const getStates = async () => {
  const response = await api.get("/states");
  return response.data;
};

export default api;