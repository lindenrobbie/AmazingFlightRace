'use strict'

    document.addEventListener("DOMContentLoaded", function () {
        const soundButton = document.getElementById("Sounds"); //kuuntelee äänilogoa
        const music = document.getElementById("music");// hakee musiikki linkin html puolelta

        soundButton.addEventListener("click", function () { //kuuntelee klikkiä
            if (music.paused) {
                music.play();
            } else {            //musiikin startti ja stoppi
                music.pause();
            }
        });
    });