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
apiURL = 'http://127.0.0.1:3000/'
// icons

// form for player name

// function to fetch data from API
async function getData() {
	try {
		const response = await fetch('http://127.0.0.1:3000/minigame');
		const data = await response.json();
		document.querySelector('#data').innerHTML = Object.values(data);
		return data;
	} catch (error) {
		console.log(error)
		};	
	};

// functions to update game status
// sends minigame data (player id, icao, points) to backend
async function minigameData(id, icao, points) {
	const data =  await fetch(`${apiURL}minigame_results?id=${id}&icao=${icao}&points=${points}`);
	const response = await data.json();
	return response;

};

// function to show weather at selected airport

// function to check if any goals have been reached

// function to update goal data and goal table in UI

// function to check if game is over

// function to set up game
// this is the main function that creates the game and calls the other functions

// event listener to hide goal splash