/**
 * ===============================
 * SERVER PRINCIPAL
 * ===============================
 * Este archivo:
 * - Inicializa Express
 * - Conecta MongoDB
 * - Registra rutas
 * - Crea HTTP Server
 * - Inicializa Socket.IO
 * - Llama al manejador de sockets
 */
require("dotenv").config();
require("dotenv").config({ path: __dirname + "../../.env" });

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

/* ======================= MIDDLEWARE ======================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.options("*", cors());
app.use(cors());

app.use((req, res, next) => {
  console.log("METODO:", req.method, "RUTA:", req.url);
  next();
});

app.use(express.json());

/* ======================= SERVER + SOCKET.IO ======================= */

const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" }
});

/* ======================= IMPORTAR SOCKETS ======================= */
/**
 * Importamos el inicializador de sockets
 * y le pasamos la instancia de io
 */
const initSockets = require("./sockets");
initSockets(io);

/* ======================= RUTAS ======================= */

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const inspectorRoutes = require("./routes/inspector");
app.use("/api/inspector", inspectorRoutes);

const choferRoutes = require("./routes/chofer");
app.use("/api/chofer", choferRoutes);

const authRoutes = require("./routes/Auth");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const demoRoutes = require("./routes/demoRoutes");
app.use("/api/demo", demoRoutes);

const routeUserStopRoutes = require("./routes/userRouteToStop");
app.use("/api/map", routeUserStopRoutes);


/* ======================= START APP  MONGO ======================= */

const startServer = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo conectado correctamente");

    /* SOCKETS */
    const initSockets = require("./sockets/index");
    initSockets(io);

    /* SERVER */
    const PORT = process.env.PORT || 4001;

    server.listen(PORT, "0.0.0.0", () => {
      console.log("SERVIDOR CORRIENDO EN PUERTO", PORT);
    });

  } catch (err) {
    console.error("ERROR INICIANDO SERVER:", err);
  }
};

startServer();

/* ======================= START SERVER ======================= */

const PORT = process.env.PORT || 4001;

