const express = require("express");
const router = express.Router();

const { routeUserToStop } = require("../services/routeUserToStop");

router.post("/route-user-stop", async (req, res) => {
  try {
    const { user, stop, travelMode } = req.body;

    if (!user || !stop) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const route = await routeUserToStop(user, stop);

    res.json(route);
  } catch (err) {
    console.error("ERROR OSRM:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;