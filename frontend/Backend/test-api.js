const http = require("http");

const data = JSON.stringify({
  crop: "Wheat",
  location: "Jaipur",
  region: [
    { lat: 26.88, lng: 75.72 },
    { lat: 26.88, lng: 75.86 },
    { lat: 26.98, lng: 75.86 },
    { lat: 26.98, lng: 75.72 },
  ],
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/sowing/analyze",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let response = "";

  res.on("data", (chunk) => {
    response += chunk;
  });

  res.on("end", () => {
    console.log(response);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(data);
req.end();