'use strict'


async function playerdata() {
  const data = await fetch("http://127.0.0.1:3000/scoreboard")
  const data_json = await data.json()
  const ol = document.querySelector("ol")
  console.log(data_json)


  for (let i of data_json){
    const li = document.createElement("li")
    li.innerText = ("name: ") + i.name + ("      points: ") + i.points
    ol.appendChild(li)
  }
}

playerdata()

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