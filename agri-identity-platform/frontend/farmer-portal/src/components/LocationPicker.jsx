
import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ClickHandler = ({ onLocationFound }) => {
    useMapEvents({
        click(e) {
            onLocationFound(e.latlng);
        },
    });
    return null;
};

const LocationPicker = ({ onSelect }) => {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLocationClick = async (latlng) => {
        setPosition(latlng);
        setLoading(true);
        try {
            // Reverse Geocoding with Nominatim (Free, No Key)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();

            if (data && data.display_name) {
                // Extract a simpler name (e.g., Village, City, State)
                const addr = data.address;
                const shortName = [addr.village, addr.town, addr.city, addr.county, addr.state_district, addr.state].filter(Boolean).slice(0, 3).join(', ');

                onSelect(shortName || data.display_name);
            } else {
                onSelect(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            onSelect(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
        } finally {
            setLoading(false);
        }
    };

    const center = [20.5937, 78.9629]; // India Center

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', position: 'relative' }}>
            {loading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, background: 'rgba(255,255,255,0.7)', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                    Fetching location name...
                </div>
            )}
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <ClickHandler onLocationFound={handleLocationClick} />
                {position && <CircleMarker center={position} radius={10} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }} />}
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
