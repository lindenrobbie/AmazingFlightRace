import { initFlightBackground } from './background.js';

initFlightBackground('#game-background');

// Load and render map
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/coordinates');
    const cities = await response.json();

    const map = L.map('map', { zoomControl: false });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 10
    }).addTo(map);

    const markers = cities.map(city =>
      L.marker([city.lat, city.lon])
        .addTo(map)
        .bindPopup(city.name)
    );

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));

  } catch (err) {
    console.error("Map load error:", err);
  }
});