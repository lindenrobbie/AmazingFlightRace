'use strict';

async function getMinigame(icao) {
	try {
		const response = await fetch(`http://127.0.0.1:3000/minigame?icao=${icao}`);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error)
		};	
	};

	
document.querySelector('#getData').addEventListener('submit', async (evt) => {
	evt.preventDefault();
	const input = document.querySelector('#icao').value;
	const data = await getMinigame(input);
	document.querySelector('#data').innerHTML = Object.values(data);
})
