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

// icons

// form for player name
document.querySelector('#player-form').addEventListener('submit', async function (evt) {
	evt.preventDefault();
	const playerName = document.querySelector('#player-input').value;
	document.getElementById('player-modal').style.display = 'none';
	
	try {
		const sendData = await fetch(`${apiURL}/start?name=${playerName}&loc=${startPos}&points=${points}&co2=${co2Used}`);
		return sendData;
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

// event listener to hide goal splash