'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Orange Marker
const orangeIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #FF4D00; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(255, 77, 0, 0.4); animation: pulse 2s infinite;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Job {
  id: string;
  title: string;
  reward: string;
  lat: number;
  lng: number;
  category: string;
}

interface JobMapProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function JobMap({ jobs, onSelectJob }: JobMapProps) {
  const defaultCenter: [number, number] = [-6.2297, 106.8166];

  return (
    <div className="h-full w-full grayscale-[0.8] invert-[0.9] hue-rotate-[180deg]"> 
      {/* Making the map dark themed using filters */}
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#0A0A0A' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {jobs.map((job) => (
          <Marker 
            key={job.id} 
            position={[job.lat, job.lng]} 
            icon={orangeIcon}
            eventHandlers={{
              click: () => onSelectJob(job),
            }}
          />
        ))}
        <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 0, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 77, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 0, 0); }
          }
          .leaflet-container {
            background: #0A0A0A !important;
          }
        `}</style>
      </MapContainer>
    </div>
  );
}
