import { useEffect, useState } from "react";

export const useUserToStopRoute = (userPosition, nearestStop) => {

  const [routeData, setRouteData] = useState(null);
  const [setRouteInfo] = useState(null);

  useEffect(() => {

    // 🔥 limpiar datos anteriores
    setRouteData(null);
    setRouteInfo(null);

    if (!userPosition || !nearestStop) return;

    const fetchRoute = async () => {

      try {

        if (!userPosition || !nearestStop) return;

        const res = await fetch(
          "https://mibus-backend-1.onrender.com/api/map/route-user-stop",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: userPosition,
              stop: {
                lat: nearestStop.geometry.coordinates[1],
                lon: nearestStop.geometry.coordinates[0],
              },
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Error en backend");
        }

        const data = await res.json();

        console.log("RUTA:", data);

        if (data.error) {
          console.error("OSRM ERROR:", data.error);
          return;
        }

        // 🔥 reemplazar TODO el estado
        setRouteData({
          route: data.coordinates.map((p) => [p.lat, p.lon]),
          streetName: data.streetName,
          distance: data.distance,
          duration: data.duration,
        });

        setRouteInfo(data);

      } catch (err) {

        console.error("ERROR RUTA:", err);

      }

    };

    fetchRoute();

  }, [userPosition, nearestStop]);

  return routeData;
};