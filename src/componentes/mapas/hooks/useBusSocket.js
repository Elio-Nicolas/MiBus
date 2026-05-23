import { useEffect, useState } from "react";
import { socket } from "../../../socket";

export const useBusSocket = () => {
  const [buses, setBuses] = useState([]);
  const [busTrails, setBusTrails] = useState({});

  useEffect(() => {

    const handleBusUpdate = (payload) => {
      const list = Array.isArray(payload) ? payload : [payload];

      setBuses((prev) => {
        const updated = [...prev];

        list.forEach((u) => {
          const index = updated.findIndex(b => b.unitId === u.unitId);

          const newBus = {
            unitId: u.unitId,
            driverName: u.driverName,
            linea: u.linea || u.line,
            lat: u.lat,
            lon: u.lon,
            color: u.color || "#007bff",
            lastUpdate: u.lastUpdate,
            nextStopName: u.nextStopName,
            etaSeconds: u.etaSeconds,
            atStop: u.atStop
          };

          if (index !== -1) {
            updated[index] = { ...updated[index], ...newBus };
          } else {
            updated.push(newBus);
          }
        });

        return updated;
      });

      setBusTrails((prev) => {
        const next = { ...prev };

        list.forEach((u) => {
          if (!u.lat || !u.lon) return;

          if (!next[u.unitId]) next[u.unitId] = [];

          next[u.unitId] = [
            ...next[u.unitId],
            [u.lat, u.lon]
          ].slice(-8);
        });

        return next;
      });
    };

    const handleUserStopped = () => {
      setBuses([]);
      setBusTrails({});
    };

    socket.on("busUpdate", handleBusUpdate);
    socket.on("userStopped", handleUserStopped);

    return () => {
      socket.off("busUpdate", handleBusUpdate);
      socket.off("userStopped", handleUserStopped);
    };

  }, []);

  return { buses, busTrails };
};