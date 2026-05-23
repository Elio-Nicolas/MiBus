// routes/demoRoutes.js

const express = require("express");
const router = express.Router();
const { getDemoStatus } = require("../controllers/demoController");

router.get("/status", getDemoStatus);

module.exports = router;