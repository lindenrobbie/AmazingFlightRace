'use strict';

// global variables
const apiURL = 'http://127.0.0.1:3000/';
const startPos = 'EFHK';
const co2Budget = 4700;
let co2Used = 0;
let points = 0;
const id = sessionStorage.getItem("id");
let currentPos = sessionStorage.getItem("currentPos");
const weather_key = '4cf609616c0b2b448b06bd90265d1cf6';

window.addEventListener('load', async () => {
  try {
    if (id !== null) {
      document.querySelector('#player-modal').classList.add('hide');
    }
    const infoBox_Data = await playerdata()

    if (infoBox_Data.co2 >= co2Budget) {
      const gameOver = await fetch(`${apiURL}scoreboard?id=${id}`);
      const gameOverData = await gameOver.json();
      alert(`Game over! \n\nPisteesi: ${infoBox_Data.score}`);
      console.log('poistetaan session storage');
      sessionStorage.clear();
      window.location.href = 'leaderboard.html';

    }

    document.querySelector("#playername").innerHTML = "Your name is: " + await infoBox_Data.name
    document.querySelector("#airport_name").innerHTML = "Current airport: " + await infoBox_Data.airport_name
    document.querySelector("#score").innerHTML = "Your score is: " + await infoBox_Data.score
    document.querySelector("#co2").innerHTML = "Used co2: " + await infoBox_Data.co2
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
    sessionStorage.setItem("currentPos", startPos);
    window.location.reload();
    return id;
  } catch (error) {
    console.log(error);
  }
});

// Fetch nykyisen sijainnin koordinaatit

async function currentcoordinates() {
  try{
    const response = await fetch(`${apiURL}/getPlayerInfo?id=${id}`)
    const response_json = await response.json()
    const coords = {"lat":response_json.lat,
                    "lon":response_json.lon
                    }
    console.log(coords)
    return coords
  } catch(error) {
    console.log(error)
  }
}


// KARTTA

fetch(`${apiURL}/coordinates?id=${id}`)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(async cities => {
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

    //kutsuu nykyiset koordinaatit ja lisää sen karttaan
    const currentCity = await currentcoordinates()
    const currentMarker = L.marker([currentCity.lat, currentCity.lon]).addTo(map);
    currentMarker.bindPopup('<p>You are here</p>')

    
    // LISÄÄ KAUPUNKI PINNIT

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
              <p>Etäisyys nykyisestä sijainnista ${city.distance} km!</p>
              <p>Co2 kulutus tähän lentokenttään ${city.co2} kg!</p>
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

//Kerää pelaajan tietoja infoboxia varten
async function playerdata() {
  try{
  const data = await fetch(`${apiURL}getPlayerInfo?id=${id}`)
  const data_json = await data.json()
  const infobox_text = {
    "co2":data_json.co2,
    "name":data_json.name,
    "airport_name":data_json.airport_name,
    "score":data_json.score
  }
  return infobox_text
}
  catch(error){
    console.log(error)
  }
}

