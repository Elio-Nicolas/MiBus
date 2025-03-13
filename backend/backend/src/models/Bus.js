const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busId: String,   // ID único del colectivo
  lat: Number,     // Latitud actual
  lng: Number,     // Longitud actual
  lastUpdated: { type: Date, default: Date.now }, // Última actualización
});

module.exports = mongoose.model("Bus", busSchema);
