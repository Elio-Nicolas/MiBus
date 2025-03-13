const express = require("express");
const Bus = require("../models/Bus");

const router = express.Router();

// Obtener todos los colectivos
router.get("/", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo colectivos" });
  }
});

module.exports = router;
