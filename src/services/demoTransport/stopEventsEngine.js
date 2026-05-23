/**
 * stopEventsEngine.js
 *
 * Motor profesional de detección de paradas.
 * Soporta:
 * - Dirección (ida / vuelta)
 * - Cabeceras
 * - Control de visitadas por vuelta
 * - Cambio automático de sentido
 * * Requiere:
 * busState:
 * {
 *   currentDirection: "ida" | "vuelta",
 *   visitedStops: Set(),
 *   lapStartedAt: Date
 * }
 */

/**
 * stopEventsEngine.js
 *
 * Motor profesional de detección de paradas.
 * Soporta:
 * - Dirección (ida / vuelta)
 * - Cabeceras
 * - Control de visitadas por vuelta
 * - Cambio automático de sentido
 * * Requiere:
 * busState:
 * {
 *   currentDirection: "ida" | "vuelta",
 *   visitedStops: Set(),
 *   lapStartedAt: Date
 * }
 */

function distance(a, b) {
  const dx = (a.lon - b.lon) * 111320;
  const dy = (a.lat - b.lat) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
}

const ARRIVAL_RADIUS = 60;   // metros
const AT_STOP_RADIUS = 30;   // metros

function detectStopEvents(busPos, stops, busState, unitId, saveLapCallback) {

  if (!busState) {
    throw new Error("busState es requerido");
  }

  // 1️⃣ Filtrar solo paradas del sentido actual
  const validStops = stops.filter(
    s => s.properties.direction === busState.currentDirection
  );

  let nearestStop = null;
  let minDist = Infinity;

  for (const stop of validStops) {

    const stopPoint = {
      lon: stop.geometry.coordinates[0],
      lat: stop.geometry.coordinates[1]
    };

    const d = distance(busPos, stopPoint);

    if (d < minDist) {
      minDist = d;
      nearestStop = stop;
    }
  }

  if (!nearestStop) {
    return {
      nextStop: null,
      eta: null,
      status: null
    };
  }

  const stopId = nearestStop.properties.id;

  const stopPoint = {
    lon: nearestStop.geometry.coordinates[0],
    lat: nearestStop.geometry.coordinates[1]
  };

  const d = distance(busPos, stopPoint);

  let status = null;

  // 2️⃣ Determinar estado
  if (d < AT_STOP_RADIUS && !busState.visitedStops.has(stopId)) {

    busState.visitedStops.add(stopId);
    status = "AT_STOP";

    // 3️⃣ Si es terminal → manejar cambio de sentido
    if (nearestStop.properties.isTerminal) {

      if (busState.currentDirection === "ida") {

        // Llegó a cabecera B → cambia a vuelta
        busState.currentDirection = "vuelta";
        busState.visitedStops.clear();

      } else {

        // Llegó a cabecera A → vuelta completa
        const completedAt = new Date();

        if (saveLapCallback) {
          saveLapCallback({
            unitId,
            startedAt: busState.lapStartedAt,
            completedAt
          });
        }

        // Reiniciar ciclo
        busState.currentDirection = "ida";
        busState.visitedStops.clear();
        busState.lapStartedAt = new Date();
      }
    }

  } else if (d < ARRIVAL_RADIUS) {
    status = "ARRIVING";
  } else {
    status = "DEPARTED";
  }

  return {
    nextStop: nearestStop.properties,
    eta: minDist / 6, // 6 m/s ≈ 21.6 km/h
    status
  };
}

module.exports = { detectStopEvents };