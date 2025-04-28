'use strict'
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("Manual").addEventListener("click", function() {
        window.open("manual.html", "ManualPopup", "width=700,height=900");
    });
})

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