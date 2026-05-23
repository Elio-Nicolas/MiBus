const fs = require("fs");
const path = require("path");
const { buildRouteFromStops } = require("./routerBuilder");
const { startBusSimulation } = require("./busSimulator");

async function startDemo(io) {

  // 🔥 LIMPIAR TODO ANTES DE ARRANCAR
  if (global.__SIMS__) {
    global.__SIMS__.forEach(ctrl => {
      ctrl.running = false;
      ctrl._cancelSleep?.();
    });
    global.__SIMS__.clear();
  }

  const geojsonPath = path.join(
    __dirname,
    "../../data/lineaA_updated.geojson"
  );

  const geojson = JSON.parse(
    fs.readFileSync(geojsonPath, "utf-8")
  );

  const route = await buildRouteFromStops(geojson);

  const linea = {
    _id: "64f0000000000000000000a1",
    name: "Linea A",
    startPoint: {
      coordinates: [route.cabeceraA.lon, route.cabeceraA.lat]
    },
    endPoint: {
      coordinates: [route.cabeceraB.lon, route.cabeceraB.lat]
    },
    toleranceStartMeters: 250,
    toleranceEndMeters: 250,
    minLapTimeSeconds: 20
  };

  const buses = [
    { unitId: "DEMO-A-01", offset: 0, driverName: "Carlos Gómez" },
    { unitId: "DEMO-A-02", offset: 20, driverName: "Lucía Fernández" },
    { unitId: "DEMO-A-03", offset: 40, driverName: "Miguel Rojas" }
  ];

  buses.forEach(bus => {
    startBusSimulation({
      io,
      unitId: bus.unitId,
      route,
      stops: geojson.features,
      startOffset: bus.offset,
      linea,
      driverName: bus.driverName
    });
  });

  console.log("🚌 DEMO Línea A activa (3 colectivos simulados)");

  return {
    stop() {
      console.log("🛑 STOP GLOBAL DEMO");

      if (global.__SIMS__) {
        global.__SIMS__.forEach(ctrl => {
          ctrl.running = false;
          ctrl._cancelSleep?.();
        });

        global.__SIMS__.clear();
      }

      console.log("🛑 TODAS LAS SIMULACIONES ELIMINADAS");

      io.emit("demo:state", {
        totalBuses: 0,
        drivers: []
      });
    },

    pause() {
      global.__SIMS__?.forEach(ctrl => ctrl.paused = true);
      console.log("⏸️ DEMO pausada");
    },

    resume() {
      global.__SIMS__?.forEach(ctrl => ctrl.paused = false);
      console.log("▶️ DEMO reanudada");
    }
  };
}

module.exports = { startDemo };