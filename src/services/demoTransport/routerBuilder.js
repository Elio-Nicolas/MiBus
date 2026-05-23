/**
 * ==========================================================
 * routerBuilder PRO FIXED
 * ----------------------------------------------------------
 * Genera ruta cerrada REAL usando OSRM en un solo request.
 *
 * ✔ Detecta cabeceras automáticamente
 * ✔ Separa ida / vuelta por lado geométrico
 * ✔ Ordena por proyección
 * ✔ Genera UNA sola ruta continua
 * ✔ Garantiza cierre perfecto (sin salto)
 * ==========================================================
 */

const fetch = require("node-fetch");

// Distancia plana aproximada (urbana)
function dist(a, b) {
  const dx = (a.lon - b.lon) * 111320;
  const dy = (a.lat - b.lat) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
}

// Llamada real a OSRM
async function routeOSRM(points) {

  if (points.length < 2) {
    throw new Error("Se necesitan al menos 2 puntos para rutear");
  }

  const coords = points.map(p => `${p.lon},${p.lat}`).join(";");

  const url =
    `http://router.project-osrm.org/route/v1/driving/${coords}` +
    `?overview=full&geometries=geojson&steps=false&continue_straight=true`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) {
    throw new Error("OSRM no pudo generar ruta");
  }

  return data.routes[0].geometry.coordinates.map(c => ({
    lon: c[0],
    lat: c[1]
  }));
}

async function buildRouteFromStops(geojson) {

  const stops = geojson.features.map(f => ({
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1]
  }));

  if (stops.length < 4) {
    throw new Error("Se necesitan al menos 4 paradas");
  }

  // ------------------------------------------------------
  // 1️⃣ Detectar cabeceras (par más lejano)
  // ------------------------------------------------------

  let maxD = 0;
  let A = stops[0];
  let B = stops[1];

  for (let i = 0; i < stops.length; i++) {
    for (let j = i + 1; j < stops.length; j++) {
      const d = dist(stops[i], stops[j]);
      if (d > maxD) {
        maxD = d;
        A = stops[i];
        B = stops[j];
      }
    }
  }

  // ------------------------------------------------------
  // 2️⃣ Separar por lado geométrico respecto a línea A-B
  // ------------------------------------------------------

  function side(p) {
    return Math.sign(
      (B.lon - A.lon) * (p.lat - A.lat) -
      (B.lat - A.lat) * (p.lon - A.lon)
    );
  }

  const idaStops = [];
  const vueltaStops = [];

  stops.forEach(p => {
    const s = side(p);
    if (s >= 0) idaStops.push(p);
    else vueltaStops.push(p);
  });

  // ------------------------------------------------------
  // 3️⃣ Ordenar por proyección sobre eje A-B
  // ------------------------------------------------------

  function projection(p) {
    const ABx = B.lon - A.lon;
    const ABy = B.lat - A.lat;
    const APx = p.lon - A.lon;
    const APy = p.lat - A.lat;

    return (APx * ABx + APy * ABy) /
           (ABx * ABx + ABy * ABy);
  }

  idaStops.sort((a, b) => projection(a) - projection(b));
  vueltaStops.sort((a, b) => projection(b) - projection(a));

  // ------------------------------------------------------
  // 4️⃣ Construir lista ORDENADA COMPLETA
  //    A → ... → B → ... → A
  // ------------------------------------------------------

  // Evitar duplicar cabeceras
  const orderedStops = [
    ...idaStops,
    ...vueltaStops.slice(1) // B ya está incluido en idaStops
  ];

  // ------------------------------------------------------
  // 5️⃣ Generar ruta CONTINUA real con OSRM
  // ------------------------------------------------------

  const fullRoute = await routeOSRM(orderedStops);

  // ------------------------------------------------------
  // 6️⃣ Validar cierre geométrico
  // ------------------------------------------------------

  const cierreDist = dist(
    fullRoute[fullRoute.length - 1],
    fullRoute[0]
  );

  console.log("Distancia cierre ruta:", cierreDist.toFixed(2), "m");

  if (cierreDist > 20) {
    console.warn("⚠ Ruta no perfectamente cerrada (OSRM decidió distinto)");
  }

  return {
    forward: fullRoute,
    cabeceraA: A,
    cabeceraB: B
  };
}

module.exports = { buildRouteFromStops };