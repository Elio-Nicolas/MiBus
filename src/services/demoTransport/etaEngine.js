/**
 * ==========================================================
 * etaEngine.js
 * ----------------------------------------------------------
 * Motor profesional de cálculo de ETA sobre ruta OSRM.
 *
 * Características:
 * - Respeta sentido actual (ida / vuelta)
 * - Ignora paradas ya visitadas
 * - Calcula distancia real recorriendo la polilínea
 * - Soporta rutas circulares (loop)
 * - Devuelve paradas ordenadas por proximidad real futura
 * ==========================================================
 */

function distance(a, b) {
  const dx = (a.lon - b.lon) * 111320;
  const dy = (a.lat - b.lat) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 🔎 Encuentra índice más cercano del bus dentro de la ruta
 */
function findClosestIndex(route, position) {
  let best = 0;
  let min = Infinity;

  for (let i = 0; i < route.length; i++) {
    const d = distance(route[i], position);
    if (d < min) {
      min = d;
      best = i;
    }
  }

  return best;
}

/**
 *  Calcula distancia restante real siguiendo la polilínea
 * Soporta loop circular
 */
function remainingDistance(route, startIndex, stopPoint) {
  let dist = 0;
  let i = startIndex;

  while (true) {
    const next = (i + 1) % route.length;

    dist += distance(route[i], route[next]);

    if (distance(route[next], stopPoint) < 30) break;

    i = next;

    if (i === startIndex) break; // seguridad anti-loop infinito
  }

  return dist;
}

/**
 * 🚦 Cálculo principal de ETA
 */
function computeETA(route, busPos, speed, stops, busState) {

  if (!busState) return [];

  const startIndex = findClosestIndex(route, busPos);

  // 1️⃣ Filtrar solo sentido actual y no visitadas
  const validStops = stops.filter(
    s =>
      s.properties.direction === busState.currentDirection &&
      !busState.visitedStops.has(s.properties.id)
  );

  const etaResults = validStops.map(stop => {

    const stopPoint = {
      lon: stop.geometry.coordinates[0],
      lat: stop.geometry.coordinates[1]
    };

    const remainingDist = remainingDistance(route, startIndex, stopPoint);

    const etaSec = remainingDist / (speed * 1000 / 3600);

    return {
      stopId: stop.properties.id,
      stopName: stop.properties.name,
      etaSeconds: Math.round(etaSec),
      remainingDistance: remainingDist
    };
  });

  // 2️⃣ Ordenar por distancia real restante
  etaResults.sort((a, b) => a.remainingDistance - b.remainingDistance);

  return etaResults;
}

module.exports = { computeETA };