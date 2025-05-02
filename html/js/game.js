'use strict';

/* 1. show map using Leaflet library. (L comes from the Leaflet library) */
/*
const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);
 */

// global variables
const apiURL = 'http://127.0.0.1:3000/'
const startPos = 'LGAV'
const co2Budget = 1000
let co2Used = 0
let points = 0
const id = sessionStorage.getItem("id");
const currentPos = sessionStorage.getItem("currentPos");

window.addEventListener('load', () => {
  try {
    if (id !== null) {
    document.querySelector('#player-modal').classList.add('hide'); 
      }
  } catch (error) {
    console.log(error)
  };
});
// icons

// form for player name
document.querySelector('#player-form').addEventListener('submit', async function (evt) {
	evt.preventDefault();
	const playerName = document.querySelector('#player-input').value;
	document.querySelector('#player-modal').classList.add('hide');

	try {
		const sendData = await fetch(`${apiURL}/start?name=${playerName}&loc=${startPos}&points=${points}&co2=${co2Used}`);
    const data = await sendData.json();
    const id = await data[0][0]
    sessionStorage.setItem("id", id)
    return id

	} catch(error) {
		console.log(error);
	};
  });

// function to fetch data from API
async function getMinigame(icao) {
	try {
		const response = await fetch(`http://127.0.0.1:3000/minigame?icao=${icao}`);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error)
		};
	};



// functions to update game status
// sends minigame data (player id, icao, points) to backend
async function minigameResults(id, icao, points) {
	const data =  await fetch(`${apiURL}minigame_results?id=${id}&icao=${icao}&points=${points}`);
	return data;
};

// function to show weather at selected airport

// function to check if any goals have been reached

// function to update goal data and goal table in UI

// function to check if game is over

// function to set up game
// this is the main function that creates the game and calls the other functions

fetch('http://127.0.0.1:3000/coordinates') // Koordinaatit servolta
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(cities => {

    // zoomit pois
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

      let weather = "TÄHÄN SÄÄTIETO STRINGINÄ"

      //popupi ikkunat halutaanko edetä seuraavaan minipeliin
      const popupContent = `
        <div>
          <p>"${weather}"</p>  
          <p>Do you want to fly to ${city.name}?</p>
          <button class="popup-btn confirm-btn" id="confirmBtn-${city.ident}">✅ Fly here</button>
        </div>
      `;

      marker.bindPopup(popupContent).on('popupopen', function() {
        setTimeout(() => {
          const confirmBtn = document.getElementById(`confirmBtn-${city.ident}`);

          if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
              fetch(`http://127.0.0.1:3000/flyto?id=${id}&icao=${city.icao}`);
              sessionStorage.setItem("currentPos", city.icao);
              alert(`Now you flight to : ${city.name}!`);
              window.location.href = 'minigame_query.html'
            });
          }
        }, 300);
      });
    });

    const group = L.featureGroup(cities.map(city => L.marker([city.lat, city.lon])));
    map.fitBounds(group.getBounds().pad(0.3));
  })
  .catch(error => console.error("Error loading map data:", error));



//MUSIIKKI
    document.addEventListener("DOMContentLoaded", function () {
        const soundButton = document.getElementById("Sounds"); //kuuntelee äänilogoa
        const music = document.getElementById("music");// hakee musiikki linkin html puolelta

        music.loop = true
        soundButton.addEventListener("click", function () { //kuuntelee klikkiä
            if (music.paused) {
                music.play();
            } else {            //musiikin startti ja stoppi
                music.pause();
            }
        });
    });