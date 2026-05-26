import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix leaflet icon issue in Next.js
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ jobs = [], center = [20.5937, 78.9629], zoom = 5, userLocation }: any) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: 'inherit', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && (
        <>
          <Marker position={userLocation} icon={customIcon}>
            <Popup>
               <span className="font-bold text-blue-600">You are here</span>
            </Popup>
          </Marker>
          <Circle center={userLocation} radius={10000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} />
        </>
      )}
      {jobs.map((job: any) => (
        <Marker key={job.id} position={[job.lat, job.lng]} icon={customIcon}>
          <Popup>
            <div className="font-bold text-sm text-slate-800">{job.title}</div>
            <div className="text-xs text-green-600 font-extrabold mb-1">₹{job.salary || job.daily_wage}/day</div>
            <a href={`/worker/job-details`} onClick={() => localStorage.setItem('kaammadat_selected_job', JSON.stringify(job))} className="text-blue-500 underline text-xs font-bold hover:text-blue-700">
              View & Apply
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
