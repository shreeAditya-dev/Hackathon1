const express = require("express");
const { analyzeSowing } = require("../controllers/sowingController");

const router = express.Router();

router.post("/analyze", analyzeSowing);

module.exports = router;