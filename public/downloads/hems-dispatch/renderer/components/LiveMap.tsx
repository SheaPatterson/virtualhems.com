import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { TelemetryData } from '../lib/models';
import L from 'leaflet';

// Fix for default icon path issue with webpack
const icon = L.icon({ 
    iconUrl: './images/cessna.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

interface LiveMapProps {
    telemetry: TelemetryData | null;
}

const LiveMap: React.FC<LiveMapProps> = ({ telemetry }) => {
    const position = telemetry ? [telemetry.latitude, telemetry.longitude] : [51.505, -0.09]; // Default to London if no data

    return (
        <div className="map-container">
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {telemetry && (
                    <Marker position={position} icon={icon}>
                        <Popup>
                            Altitude: {telemetry.altitude.toFixed(2)} ft <br />
                            Airspeed: {telemetry.airspeed.toFixed(2)} kts
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
