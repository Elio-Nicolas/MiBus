export const useDistance = (user, stop) => {
  if (!user || !stop) return null;

  const lat1 = user.lat;
  const lon1 = user.lon;
  const lat2 = stop.geometry.coordinates[1];
  const lon2 = stop.geometry.coordinates[0];

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // km
};