'use strict';

// global variables
const apiURL = 'http://127.0.0.1:3000/';
const startPos = 'LGAV';
const co2Budget = 10000;
let co2Used = 0;
let points = 0;
const id = sessionStorage.getItem("id");
const currentPos = sessionStorage.getItem("currentPos");
const weather_key = '4cf609616c0b2b448b06bd90265d1cf6';

window.addEventListener('load', () => {
  try {
    if (id !== null) {
      document.querySelector('#player-modal').classList.add('hide');
    }
  } catch (error) {
    console.log(error);
  }
});

// form for player name
document.querySelector('#player-form').addEventListener('submit', async function (evt) {
  evt.preventDefault();
  const playerName = document.querySelector('#player-input').value;
  document.querySelector('#player-modal').classList.add('hide');

  try {
    const sendData = await fetch(`${apiURL}/start?name=${playerName}&loc=${startPos}&points=${points}&co2=${co2Used}`);
    const data = await sendData.json();
    const id = await data[0][0];
    sessionStorage.setItem("id", id);
    return id;
  } catch (error) {
    console.log(error);
  }
});

// map + markers + weather
fetch(`${apiURL}/coordinates?id=${id}`)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(cities => {
    const map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
    }).setView([60.1695, 24.9354], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 10
    }).addTo(map);

    cities.forEach(city => {
      const marker = L.marker([city.lat, city.lon]).addTo(map);

      marker.bindPopup(`<p>Loading weather...</p>`);

      // SÄÄHAKU
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${weather_key}&units=metric&lang=fi`)
        .then(res => {
          if (!res.ok) throw new Error("Weather API error");
          return res.json();
        })
        .then(data => {
          const rawDesc = data.weather[0].description;
          const desc = rawDesc.charAt(0).toUpperCase() + rawDesc.slice(1);
          const temp = data.main.temp;
          const wind = data.wind.speed;
          const weather = `
            Sää: ${desc}<br>
            Lämpötila: ${temp}°C<br>
            Tuuli: ${wind} m/s
          `;

          const popupContent = `
            <div style="text-align: center;">
              <p>${weather}</p>
              <p>Haluatko lentää lentokenttään ${city.name}?</p>
              <p>Etäisyys nykyisestä sijainnista ${city.distance}</p>
              <p>Co2 kulutus tähän lentokenttään ${city.co2}</p>
              <button class="popup-btn confirm-btn" id="confirmBtn-${city.ident}">✅ Lennä tänne</button>
            </div>
          `;

          marker.bindPopup(popupContent).on('popupopen', function () {
            setTimeout(() => {
              const confirmBtn = document.getElementById(`confirmBtn-${city.ident}`);
              if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                  sessionStorage.setItem("currentPos", city.icao);
                  fetch(`${apiURL}flyto?id=${sessionStorage.getItem("id")}&icao=${city.icao}`);
                  alert(`Lennetään: ${city.name}!`);
                  window.location.href = 'minigame_query.html';
                });
              }
            }, 300);
          });
        })
        .catch(err => {
          console.error(`Weather fetch failed for ${city.name}:`, err);
          const popupContent = `
            <div>
              <p>Säätiedon haku epäonnistui.</p>
              <p>Haluatko lentää lentokenttään ${city.name}?</p>
              <button class="popup-btn confirm-btn" id="confirmBtn-${city.ident}">✅ Lennä tänne</button>
            </div>
          `;
          marker.bindPopup(popupContent);
        });
    });

    const group = L.featureGroup(cities.map(city => L.marker([city.lat, city.lon])));
    map.fitBounds(group.getBounds().pad(0.3));
  })
  .catch(error => console.error("Error loading map data:", error));

// music toggle
document.addEventListener("DOMContentLoaded", function () {
  const soundButton = document.getElementById("Sounds");
  const music = document.getElementById("music");

  music.loop = true;
  soundButton.addEventListener("click", function () {
    if (music.paused) {
      music.play();
    } else {
      music.pause();
    }
  });
});
