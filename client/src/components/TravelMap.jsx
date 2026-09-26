import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

const TravelMap = ({ onSelectDestination }) => {
  const mapRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // 1. Load Leaflet CSS and JS dynamically if not already present
    const loadLeaflet = async () => {
      if (window.L) {
        setLeafletLoaded(true);
        return;
      }

      // Add CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add JS
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);
      } else {
        // Wait for it to mount fully
        const checkL = setInterval(() => {
          if (window.L) {
            setLeafletLoaded(true);
            clearInterval(checkL);
          }
        }, 100);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !window.L || mapRef.current) return;

    const L = window.L;

    // 2. Initialize Map centered on Central India
    const map = L.map('map-element', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([21.1458, 79.0882], 5);

    // 3. Set tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    // 4. Plot Destinations
    const destinations = [
      { name: 'Goa, India', coords: [15.2993, 74.1240], desc: 'Relaxing sandy beaches & seafood' },
      { name: 'Jaipur, India', coords: [26.9124, 75.7873], desc: 'Historic forts & heritage palaces' },
      { name: 'Munnar, India', coords: [10.0889, 77.0595], desc: 'Mist-covered tea gardens & waterfalls' },
      { name: 'Leh Ladakh, India', coords: [34.1526, 77.5771], desc: 'Rugged mountains & high passes' }
    ];

    destinations.forEach(dest => {
      const popupContent = `
        <div style="font-family: 'Outfit', sans-serif; color: #0f172a; padding: 0.25rem; min-width: 160px;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 600;">${dest.name}</h4>
          <p style="margin: 0 0 0.75rem 0; font-size: 0.85rem; color: #475569; line-height: 1.4;">${dest.desc}</p>
          <button id="map-plan-${dest.name.replace(/[^a-zA-Z]/g, '')}" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 0.5rem 1rem; border: none; border-radius: 999px; font-size: 0.8rem; font-weight: 500; cursor: pointer; width: 100%; text-align: center; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);">
            Plan Itinerary →
          </button>
        </div>
      `;

      const marker = L.marker(dest.coords).addTo(map).bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btnId = `map-plan-${dest.name.replace(/[^a-zA-Z]/g, '')}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.onclick = () => {
            onSelectDestination({ name: dest.name });
          };
        }
      });
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, onSelectDestination]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Interactive <span className="text-gradient">Travel Map</span></h2>
        <p className="text-muted">Browse destinations on the map and click "Plan Itinerary" to kick off your trip details.</p>
      </div>

      <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {!leafletLoaded && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
            <Loader className="text-primary animate-spin" size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <span className="text-muted">Loading maps...</span>
          </div>
        )}
        <div id="map-element" style={{ width: '100%', height: '500px', borderRadius: '1rem', background: '#0f172a' }} />
      </div>
    </div>
  );
};

export default TravelMap;
