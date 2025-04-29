'use strict';

const url = 'http://127.0.0.1:3000/minigame'

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

async function postData(url) {
	const data =  await fetch(url);
	const response = await data.json();
	return response;

};

document.querySelector('#button').addEventListener('click', () => {
	getData(url);
})

document.querySelector('#update').addEventListener('click', () => {
	postData(url);
})