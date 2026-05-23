/**
 * ==========================================================
 * busSimulator.js
 * ----------------------------------------------------------
 * Simulador AVL de colectivo en tiempo real.
 *
 * Responsabilidades:
 * - Recorre la ruta generada (OSRM)
 * - Interpola movimiento con velocidad variable realista
 * - Calcula ETA dinámico hacia próximas paradas
 * - Detecta eventos de parada (ARRIVING / AT_STOP / DEPARTED)
 * - Respeta sentido ida / vuelta
 * - Controla cabeceras y cambio automático de dirección
 * - Gestiona vueltas completas (Lap)
 *
 * No persiste estado dinámico en DB.
 * El estado de vuelta vive en memoria por unidad.
 * ==========================================================
 */
/**
 * ==========================================================
 * busSimulator.js
 * ==========================================================
 */

const { detectStopEvents } = require("./stopEventsEngine");
const { computeETA } = require("./etaEngine");
const { processLocation } = require("../lapDetector");

// 🔥 REGISTRO GLOBAL REAL DE SIMULACIONES
global.__SIMS__ = global.__SIMS__ || new Set();

function sleep(ms, controller) {
  return new Promise(resolve => {
    const t = setTimeout(resolve, ms);

    controller._cancelSleep = () => {
      clearTimeout(t);
      resolve();
    };
  });
}

function distance(a, b) {
  const dx = (a.lon - b.lon) * 111320;
  const dy = (a.lat - b.lat) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
}

async function startBusSimulation({
  io,
  unitId,
  route,
  stops,
  startOffset = 0,
  linea,
  driverName,
  saveLap
}) {

  console.log("🔥 START SIM:", unitId, "PID:", process.pid);

  const path = route.forward;
  let i = startOffset % path.length;

  const busState = {
    currentDirection: "ida",
    visitedStops: new Set(),
    lapStartedAt: new Date(),
    currentStopIndex: 0
  };

  const controller = {
    running: true,
    paused: false,
    _cancelSleep: null
  };

  // 🔥 REGISTRAR SIM
  global.__SIMS__.add(controller);

  console.log("🔁 LOOP LANZADO:", unitId);

  async function loop() {
    while (true) {

      if (!controller.running) {
        console.log("💀 LOOP TERMINADO:", unitId);
        return;
      }

      console.log("➡️ LOOP ITERANDO:", unitId);

      if (controller.paused) {
        await sleep(100, controller);
        continue;
      }

      const point = path[i];
      const next = path[(i + 1) % path.length];

      const speed = 20 + Math.random() * 500;

      const d = distance(point, next);
      const totalTime = d / (speed * 1000 / 3600);

      const steps = Math.max(5, Math.floor(totalTime * 2));
      const stepTime = (totalTime * 1000) / steps;

      for (let s = 0; s <= steps; s++) {

        if (!controller.running) {
          console.log("💀 LOOP CORTADO EN FOR:", unitId);
          return;
        }

        if (controller.paused) break;

        const t = s / steps;

        const lat = point.lat + (next.lat - point.lat) * t;
        const lon = point.lon + (next.lon - point.lon) * t;

        const position = { lat, lon };

        await processLocation(
          unitId,
          linea,
          lat,
          lon,
          driverName,
          Date.now(),
          io
        );

        const safeSpeed = Math.max(speed, 5);

        const etaList = computeETA(
          path,
          position,
          safeSpeed,
          stops,
          busState
        );

        const nextETA = etaList[0] || null;

        const stopInfo = detectStopEvents(
          position,
          stops,
          busState,
          unitId,
          saveLap
        );

        io.emit("busUpdate", {
          unitId,
          lat,
          lon,
          linea: linea._id,
          driverName,
          etaSeconds: stopInfo?.eta ?? nextETA?.etaSeconds ?? null,
          nextStopName: nextETA?.stopName || null,
          stopStatus: stopInfo?.status || null,
          lastUpdate: new Date().toISOString()
        });

        await sleep(stepTime, controller);
      }

      i++;

      if (i >= path.length) {

        if (saveLap) {
          saveLap({
            unitId,
            linea,
            driverName,
            startedAt: busState.lapStartedAt,
            finishedAt: new Date()
          });
        }

        busState.lapStartedAt = new Date();
        i = 0;
      }
    }
  }

  loop();

  return {
    stop: () => {
      console.log("🛑 STOP LLAMADO:", unitId);

      controller.running = false;

      if (controller._cancelSleep) {
        controller._cancelSleep();
      }

      global.__SIMS__.delete(controller);
    },
    pause: () => controller.paused = true,
    resume: () => controller.paused = false
  };
}

module.exports = { startBusSimulation };