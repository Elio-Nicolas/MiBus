/**
 * ==========================================================
 * Archivo: data/updateLineaAStops.js
 * ----------------------------------------------------------
 * Script de procesamiento de datos geoespaciales (GeoJSON).
 *
 * Descripción:
 * Este script se encarga de transformar un archivo GeoJSON
 * de paradas correspondiente a una línea de transporte,
 * enriqueciendo cada punto con información adicional
 * necesaria para su uso dentro del sistema MiBus.
 *
 * A partir de un archivo base, se generan nuevas propiedades
 * que permiten identificar el sentido del recorrido y las
 * paradas terminales.
 *
 * Funcionalidades principales:
 * - Lectura de archivo GeoJSON de entrada
 * - Asignación de dirección del recorrido:
 *   • "ida" para la primera mitad
 *   • "vuelta" para la segunda mitad
 * - Identificación de paradas terminales
 *   (primer y último punto del recorrido)
 * - Generación de un nuevo archivo GeoJSON enriquecido
 *
 * Tipo de lógica:
 * - Procesamiento offline de datos
 * - Transformación estructural de JSON
 * - Sin interacción con base de datos ni API
 *
 * Observaciones de arquitectura:
 * - Este archivo no forma parte del flujo de ejecución
 *   del backend ni del frontend.
 * - Su uso está orientado a preparación de datos previa
 *   (data preprocessing).
 * - Se ejecuta manualmente o como parte de un pipeline
 *   de carga de datos.
 *
 * Este archivo NO:
 * - Expone endpoints
 * - Maneja requests/responses
 * - Se ejecuta en producción como servicio activo
 *
 * Rol dentro del sistema:
 * Actúa como herramienta auxiliar para normalizar y
 * enriquecer datos geográficos utilizados por el sistema,
 * facilitando su consumo posterior en mapas y lógica
 * de transporte.
 * ==========================================================
 */

const fs = require("fs");

const inputPath = "./lineaA.stops.geojson";       // 👈 tu archivo real
const outputPath = "./lineaA_updated.geojson";

const geo = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const total = geo.features.length;
const half = Math.floor(total / 2);

geo.features = geo.features.map((feature, index) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  feature.properties.direction = index < half ? "ida" : "vuelta";
  feature.properties.isTerminal = isFirst || isLast;

  return feature;
});

fs.writeFileSync(outputPath, JSON.stringify(geo, null, 2));

console.log("GeoJSON actualizado correctamente");