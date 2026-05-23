import React, { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";

const ParadasLayer = ({
  paradasData,
  selectedLinea,
  visible,
  nearestStop,
  onStopClick,
}) => {


  const filteredData = useMemo(() => {

  if (!paradasData) return null;

  if (!selectedLinea) return paradasData;

  return {
    ...paradasData,
    features: paradasData.features ?? [],
  };

}, [paradasData, selectedLinea]);

  if (!visible || !filteredData) return null;

 

  return (
    <GeoJSON
      data={filteredData}
      pane="paradasPane"
      pointToLayer={(feature, latlng) => {

        const isNearest =
          nearestStop &&
          (feature.id === nearestStop.id);

        return L.marker(latlng, {
          pane: "paradasPane",
          icon: L.divIcon({
            className: "",
            html: `
              <div style="
                width:${isNearest ? 18 : 10}px;
                height:${isNearest ? 18 : 10}px;
                background:${isNearest ? "red" : "#007bff"};
                border-radius:50%;
                border:2px solid white;
                ${isNearest ? "box-shadow:0 0 10px red;" : ""}
              "></div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        });
      }}
      onEachFeature={(feature, layer) => {

        
        layer.on("click", () => {
          console.log("CLICK PARADA:", feature);
          onStopClick && onStopClick(feature);
        });

        
        const id = feature.id || "Sin ID";

        layer.bindPopup(`
          <strong>🚌 Parada</strong><br/>
          ID: ${id}
        `);
      }}
    />
  );
};

export default React.memo(ParadasLayer);