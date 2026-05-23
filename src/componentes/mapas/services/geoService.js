const toRad = (value) => (value * Math.PI) / 180;

export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getNearestStop = (userPos, paradas) => {
  if (!userPos || !paradas) return null;

  let min = Infinity;
  let nearest = null;
  
  if (!paradas?.features?.length) return null;
  
  for (const f of paradas.features) {
    const [lon, lat] = f.geometry.coordinates;

    const dist = getDistance(userPos.lat, userPos.lon, lat, lon);

    if (dist < min) {
      min = dist;
      nearest = { ...f, distance: dist };
    }
  }

  return nearest;
};