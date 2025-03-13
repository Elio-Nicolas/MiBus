import React from 'react';
import L from 'leaflet';

const MarkerComponent = ({ map, position }) => {
    React.useEffect(() => {
        if (map && position) {
            L.marker(position).addTo(map);
        }
    }, [map, position]);

    return null;
};

export default MarkerComponent;