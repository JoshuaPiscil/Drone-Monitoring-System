import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";


function FlyToLocation({ gps }) {
  const map = useMap();

  useEffect(() => {
    if (gps) {
      map.flyTo([gps.lat, gps.lng], map.getZoom());
    }
  }, [gps, map]);

  return null;
}

function Map({ gps, route }) {
  const defaultPosition = [51.0501, -114.0719];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "400px", width: "101%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {gps && <Marker position={[gps.lat, gps.lng]} />}
      <FlyToLocation gps={gps} />
      {route.length > 1 && (
      <Polyline positions={route} color="blue" />
      )}
    </MapContainer>
  );
}

export default Map;