import { useRef, useState } from "react";
import L from "leaflet";
import { socket } from "../../../socket";

export const useChoferTracking = ({
  role,
  selectedUnit,
  storedUserId,
  username
}) => {

  const [isSharing, setIsSharing] = useState(false);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);

  const startSharing = () => {

    if (isSharing) return;

    if (!("geolocation" in navigator)) {
      alert("La geolocalización no está disponible");
      return;
    }

    if (role !== "CHOFER") {
      alert("Solo los choferes pueden compartir ubicación");
      return;
    }

    if (!selectedUnit) {
      alert("Debe seleccionar una unidad");
      return;
    }

    setIsSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;

        const isDesktop = !/Mobi|Android/i.test(navigator.userAgent);

        if (accuracy > 50 && !isDesktop) return;
        if (accuracy > 2000 && isDesktop) return;

        if (lastPositionRef.current) {
          const [prevLat, prevLon] = lastPositionRef.current;

          const distance = L.latLng(prevLat, prevLon)
            .distanceTo(L.latLng(latitude, longitude));

          if (distance > 200) return;
        }

        lastPositionRef.current = [latitude, longitude];

        socket.emit("locationUpdate", {
          unitId: selectedUnit,
          driverId: storedUserId,
          driverName: username,
          lat: latitude,
          lon: longitude,
          accuracy,
          speed
        });
      },
      (err) => {
        console.error("GPS error:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const stopSharing = () => {

    setIsSharing(false);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    socket.emit("stopSharing", storedUserId);
  };

  return {
    isSharing,
    startSharing,
    stopSharing
  };
};