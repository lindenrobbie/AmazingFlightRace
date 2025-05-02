import { initFlightBackground } from './background.js';
import { getWeatherByCoords } from './api_modules.js';

initFlightBackground('#game-background');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/coordinates');
    const cities = await response.json();

    const map = L.map('map', { zoomControl: false });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 10
    }).addTo(map);

    const weatherBox = document.getElementById('weather-box');
    let playerId = sessionStorage.getItem('id');

    // VÄLIAIKANEN
    if (!playerId) {
      console.warn("UNOHDIT PELAAJA ID:n.");
      playerId = '1';
      sessionStorage.setItem('id', playerId);
    }

    console.log("Player ID:", playerId);

    const markers = cities.map(city => {
      const marker = L.marker([city.lat, city.lon]).addTo(map);

      const popupContent = `
        <div style="text-align: center;">
          <strong>${city.name}</strong><br>
          <div class="popup-button-container">
            <button class="travel-btn" data-icao="${city.icao}" data-name="${city.name}">
              ✈️ Travel
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false }).on('popupopen', () => {
        const travelBtn = document.querySelector(`.travel-btn[data-icao="${city.icao}"]`);
        if (travelBtn) {
          travelBtn.addEventListener('click', async () => {
            if (!playerId) {
              alert("Pelaajan ID:tä ei löytynyt (sessionStorage).");
              return;
            }

            // Call backend to set new location
            await fetch(`http://127.0.0.1:3000/flyto?id=${playerId}&icao=${city.icao}`);

            // Redirect to minigame
            window.location.href = 'minigame_query.html';
          });
        }
      });

      marker.on('mouseover', async () => {
        weatherBox.innerText = `Haetaan säätietoa...`;
        const weatherData = await getWeatherByCoords(city.lat, city.lon);
        if (weatherData && weatherData.weather && weatherData.main) {
          const desc = weatherData.weather[0].description;
          const temp = weatherData.main.temp;
          const wind = weatherData.wind.speed;
          weatherBox.innerHTML = `
            <strong>${city.name}</strong><br>
            Sää: ${desc}<br>
            Lämpötila: ${temp}°C<br>
            Tuuli: ${wind} m/s
          `;
        } else {
          weatherBox.innerText = 'Säätietoja ei saatavilla.';
        }
      });

      marker.on('mouseout', () => {
        weatherBox.innerText = 'Vie hiiri kaupungin päälle';
      });

      return marker;
    });

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  } catch (err) {
    console.error("Map load error:", err);
  }
});