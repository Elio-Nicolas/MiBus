const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:4000" }, // Permitir conexión con el frontend
});

// Conectar con MongoDB
mongoose.connect("mongodb://localhost:27017/colectivos", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const BusSchema = new mongoose.Schema({
  id: String,
  lat: Number,
  lon: Number,
  timestamp: { type: Date, default: Date.now },
});
const Bus = mongoose.model("Bus", BusSchema);

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado");

  // Recibir ubicación y guardar en MongoDB
  socket.on("locationUpdate", async (data) => {
    console.log("📍 Ubicación recibida:", data);
    await Bus.findOneAndUpdate({ id: data.id }, data, { upsert: true });
  });

  // Enviar ubicaciones cada 3 segundos
  setInterval(async () => {
    const buses = await Bus.find({});
    io.emit("busUpdate", buses);
  }, 3000);

  socket.on("disconnect", () => console.log("❌ Cliente desconectado"));
});

server.listen(3000, () => console.log("🚀 Backend corriendo en http://localhost:3000"));


setInterval(async () => {
  const buses = await Bus.find({});
  console.log("🔄 Enviando datos a los clientes:", buses); // 👀 Verifica si hay datos
  io.emit("busUpdate", buses);
}, 3000);
