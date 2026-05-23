// src/mock/moveVehicle.js

import { routesByLine } from "./routes";

export function moveVehicle(vehicle) {
  const route = routesByLine[vehicle.line];

  if (!route) return vehicle;

  let nextIndex = vehicle.routeIndex + vehicle.speed;

  if (nextIndex >= route.length) {
    nextIndex = 0; // vuelve al inicio (loop)
  }

  return {
    ...vehicle,
    routeIndex: nextIndex,
    position: route[nextIndex],
  };
}
