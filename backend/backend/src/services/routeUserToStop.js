const fetch = require("node-fetch");

async function routeUserToStop(user, stop) {

  console.log("USER:", user);
  console.log("STOP:", stop);

  const coords = `${user.lon},${user.lat};${stop.lon},${stop.lat}`;

  const profile =
  travelMode === "WALKING"
    ? "foot"
    : "driving";

  const url =
  `http://router.project-osrm.org/route/v1/${profile}/${coords}` +
  `?overview=full&geometries=geojson&steps=false&continue_straight=true`;

 // console.log("URL OSRM:", url);

  const res = await fetch(url);

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  //console.log("DATA OSRM:", JSON.stringify(data));

  if (!data.routes || data.routes.length === 0) {
    throw new Error("OSRM no pudo generar ruta usuario-parada");
  }

  console.log(data.routes[0]);

 return {
  coordinates: data.routes[0].geometry.coordinates.map(c => ({
    lon: c[0],
    lat: c[1],
  })),
  duration: data.routes[0].duration,
  distance: data.routes[0].distance,
  streetName: data.waypoints?.[1]?.name || "Sin nombre",
};

  
}

module.exports = { routeUserToStop };