/**
 * ===============================
 * CAPA DE TRAZADO DE BUS (TRAIL)
 * ===============================
 *
 * Este componente:
 *
 * - Renderiza el rastro (historial de movimiento) de un bus en el mapa
 * - Usa múltiples Markers de Leaflet para simular una estela visual
 *
 * ===============================
 * FUNCIONAMIENTO
 * ===============================
 *
 * - Recibe:
 *   → unitId (identificador del bus)
 *   → points (array de coordenadas [lat, lon])
 *   → color (color del bus)
 *
 * - Por cada punto:
 *   → dibuja un Marker pequeño tipo "dot"
 *   → ajusta opacidad progresiva según el índice
 *
 * ===============================
 * OBJETIVO VISUAL
 * ===============================
 *
 * Simular el recorrido del bus en el mapa:
 * - Más reciente → más visible
 * - Más antiguo → más transparente
 *
 * ===============================
 * RESPONSABILIDAD
 * ===============================
 *
 * Este componente es puramente de PRESENTACIÓN:
 *
 * - No calcula rutas
 * - No procesa datos
 * - Solo transforma un array de puntos en visualización
 *
 * ===============================
 * NOTA
 * ===============================
 *
 * Se utiliza Marker en lugar de Polyline para lograr efecto de puntos degradados
 *
 */

import { Marker } from "react-leaflet";
import L from "leaflet";

const BusTrailLayer = ({ unitId, points, color }) => {
  if (!points || points.length === 0) return null;

  return (
    <>
      {points.map((pos, idx) => (
        <Marker
          key={`${unitId}-trail-${idx}`}
          position={pos}
          icon={L.divIcon({
            className: "",
            html: `<div style="
              width: 8px;
              height: 8px;
              background: ${color};
              opacity: ${0.2 + idx * 0.15};
              border-radius: 50%;
            "></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4],
          })}
          interactive={false}
        />
      ))}
    </>
  );
};

export default BusTrailLayer;
