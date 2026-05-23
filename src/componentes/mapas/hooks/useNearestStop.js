import { useMemo } from "react";
import { getNearestStop } from "../services/geoService";

export const useNearestStop = (userLocation, paradas) => {
  const nearest = useMemo(() => {
    if (!userLocation || !paradas?.features) return null;

    return getNearestStop(userLocation, paradas);
  }, [userLocation, paradas]);

  if (!nearest) return null;

return {
  ...nearest,
  _id: nearest.id,
};
};