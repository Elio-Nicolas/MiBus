import { useEffect, useState } from "react";
import lineaA from "../../../mock/lineas.json"; // ajustá ruta si hace falta
import lineaEste from "../../../mock/lineaEste.json";

export const useParadas = (selectedLinea) => {
  const [paradas, setParadas] = useState(null);

  useEffect(() => {
  if (!selectedLinea) {
    setParadas(null);
    return;
  }

  switch (selectedLinea) {
    case "A":
      setParadas(lineaA);
      break;

    case "ZE":
      setParadas(lineaEste);
      break;

    default:
      setParadas(null);
  }
}, [selectedLinea]);

  return paradas;
};