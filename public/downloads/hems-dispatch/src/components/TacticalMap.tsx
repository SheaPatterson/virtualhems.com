import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapResizer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    map.invalidateSize();
  }, [center, map]);
  return null;
}

interface TacticalMapProps {
  baseCoords?: [number, number];
  hospitalCoords?: [number, number];
}

export default function TacticalMap({ baseCoords, hospitalCoords }: TacticalMapProps) {
  const defaultCenter: [number, number] = baseCoords || [39.8283, -98.5795];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 min-h-[500px]">
      <MapContainer 
        center={defaultCenter} 
        zoom={8} 
        className="w-full h-full grayscale-[0.8] invert-[0.9] hue-rotate-[180deg]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {baseCoords && (
          <Marker position={baseCoords} icon={icon}>
            <Popup>Launch Base</Popup>
          </Marker>
        )}

        {hospitalCoords && (
          <Marker position={hospitalCoords} icon={icon}>
            <Popup>Receiving Hospital</Popup>
          </Marker>
        )}

        {baseCoords && hospitalCoords && (
          <>
            <Polyline 
              positions={[baseCoords, hospitalCoords]} 
              color="#f97316" 
              weight={3} 
              dashArray="10, 10"
            />
            <MapResizer center={baseCoords} />
          </>
        )}
      </MapContainer>
    </div>
  );
}