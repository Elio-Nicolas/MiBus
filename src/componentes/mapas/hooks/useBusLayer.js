import { useMemo } from "react";

const LINE_COLORS = {
  A: "#007bff",
  B: "#e91e63",
  C: "#4caf50",
  D: "#ff9800",
};

export const useBusLayer = (buses, busTrails, selectedLinea) => {
  const processed = useMemo(() => {
    const validBuses = [];
    const trails = {};

    for (const bus of buses || []) {
      const lat = Number(bus.lat);
      const lon = Number(bus.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      // filtro por línea
      if (selectedLinea && bus.linea !== selectedLinea) continue;

      const line = bus.linea || bus.line;
      const color = bus.color || LINE_COLORS[line] || "#9110b8ff";

      validBuses.push({
        ...bus,
        lat,
        lon,
        line,
        color,
      });

      // trails seguros
      const trail = busTrails?.[bus.unitId];
      if (Array.isArray(trail)) {
        trails[bus.unitId] = trail;
      }
    }

    return { validBuses, trails };
  }, [buses, busTrails, selectedLinea]);

  return processed;
};