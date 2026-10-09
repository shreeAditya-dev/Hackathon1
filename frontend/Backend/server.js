const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sowingRoutes = require("./routes/sowingRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/sowing", sowingRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AgriSentinal Backend is running 🌱",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

app.listen(PORT, () => {
  console.log(`🌱 AgriSentinal Backend running on port ${PORT}`);
});