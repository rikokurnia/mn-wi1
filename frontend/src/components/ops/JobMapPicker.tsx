'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  center: [number, number];
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ center, onLocationChange }: { center: [number, number], onLocationChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(center[0], center[1]));
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export default function JobMapPicker({ center, radius, onLocationChange }: MapPickerProps) {
  // Safety check for NaN values to prevent Leaflet crash
  const isValidCenter = !isNaN(center[0]) && !isNaN(center[1]);
  const safeCenter: [number, number] = isValidCenter ? center : [-6.2297, 106.8166];
  const safeRadius = isNaN(radius) ? 100 : radius;

  return (
    <div className="h-[400px] w-full rounded-[32px] overflow-hidden border-4 border-white shadow-2xl z-0">
      <MapContainer 
        center={safeCenter} 
        zoom={15} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using a cleaner light theme map
        />
        <LocationMarker center={safeCenter} onLocationChange={onLocationChange} />
        <Circle 
          center={safeCenter} 
          radius={safeRadius} 
          pathOptions={{ color: '#FF4D00', fillColor: '#FF4D00', fillOpacity: 0.2 }} 
        />
      </MapContainer>
    </div>
  );
}
