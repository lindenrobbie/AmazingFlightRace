//============================================================================================

// 1. DATA LOGIIKKA // HAETAAN DATAA

// -> WHAT COMES IN

let correctAnswerText = "";
let selectedAnswerText = "";



async function loadQuestion() {
  const pos = sessionStorage.getItem("currentPos");

  // KYSYMYS + VASTAUKSET FLASK:ISTÄ (TÄLLÄ HETKELLÄ PALAUTTAA RANDOM ARVON SQL:SSÄ MÄÄRITELTY)
  const response = await fetch(`http://127.0.0.1:3000/minigame?icao=${pos}`);
  const data = await response.json();

  // KYSYMYS H2 ELENTTIIN ID:LLÄ QUESTION (ESIM. "Minä vuonna Kööpenhaminan Kastrupin lentoasema avattiin?")
  const questionElement = document.getElementById('question');
  questionElement.textContent = data.question;

  // SPLITTAA PALAUTETTU MÖSSÖ # MERKILLÄ (ESIM. 1925#1935#1945#1955 -> 1925 1935 1945 1955)
  const allOptions = data.options.split('#');

  // MÄÄRITTELEE MIKÄ INDEXI ON OIKEA VASTAUS
  // OIKEA VASTAUS = ANSWERS INTEGER
  // JOS ANSWERS ARVO ON ESIM. 1 NIIN OIKEA VASTAUS TÄSTÄ: 1925 1935 1945 1955 OLISI 1935 (ELI ENSIMMÄINEN ARVO)
  // VS JOS ANSWERS ARVO ON 2 NIIN SE OLISI 1935 (TOINEN ARVO)

  const correctIndex = parseInt(data.answer) - 1; //  SQL:ÄSSÄ INDEXIT ALKAA 1, JA JAVASCRIPTISTÄ 0. 👎 TÄSSÄ SE KORJATAAN

  // TÄSSÄ MÄÄRITELLÄÄN OIKEA VASTAUS
  // ANSWERS ARVO = INDEXI OIKEALLE VASTAUKSELLE

  correctAnswerText = allOptions[correctIndex];

//============================================================================================

  // 2. FRONTEND LOGIIKKA // TÄSSÄ ANNETAAN ELEMENTEILLE TEKSTIT MITÄ HAETTIIN YLHÄÄLLÄ.

  // TÄSSÄ HAETAAN BUTTON ELEMENTIT HTML TIEDOSTOSTA
  const optionButtons = document.querySelectorAll('.option-btn');

  // MÄÄRITELLÄÄN NAPPIEN MÄÄRÄ
  for (let i = 0; i < optionButtons.length; i++) {
    let button = optionButtons[i];

    // LISÄTÄÄN NAPPEIHIN KYSYMYKSET
    if (i < allOptions.length) {
      button.textContent = allOptions[i];
    } else {
      button.textContent = ""; // Jos vaihtoehtoa ei ole, tyhjä
    }

    button.disabled = false;
    button.classList.remove('selected');

    // Kun nappia klikataan
      button.onclick = function () {
        for (let j = 0; j < optionButtons.length; j++) {
          optionButtons[j].classList.remove('selected');
        }

        button.classList.add('selected');
        selectedAnswerText = button.textContent;
        document.getElementById('confirm-btn').disabled = false;

        // TEKEE ÄÄNEN KUN PAINAT NAPPIA
        const selectSound = new Audio('assets/select.wav');
        selectSound.play();
      };
  }

  // Resetoi Confirm-napin ja tulosviestin
  document.getElementById('confirm-btn').disabled = true;
  document.getElementById('result').textContent = "";
}

//============================================================================================

// 3. CONFIRM NAPPI JA SUBMISSION // SETTAUS LOGIIKKA

// -> WHAT COMES OUT

const confirmButton = document.getElementById('confirm-btn');

confirmButton.addEventListener('click', async () => {
  if (selectedAnswerText === "") {
    return;
  }

  const resultElement = document.getElementById('result');

  let points
  if (selectedAnswerText === correctAnswerText) {
    resultElement.textContent = "Oikein! ✅";
    resultElement.style.color = "green";
    const rightSound = new Audio('assets/right_answer.wav');
    rightSound.play();
    // KIRJOITA TÄHÄN PLUS PISTEET
    points = "100"
  } else {
    resultElement.textContent = "Väärin! ❌";
    resultElement.style.color = "red";
    const wrongSound = new Audio('assets/wrong_answer.wav');
    wrongSound.play();
    // KIRJOITA TÄHÄN MINUS PISTEET
    points = "0"
  }

  // DISABLOI VAIHTOEHDOT KUN CONFIRM NAPPIA ON PAINETTU
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  confirmButton.disabled = true;

  const id = sessionStorage.getItem("id");
  const pos = sessionStorage.getItem("currentPos");

  console.log(id);

  const results = await fetch(`http://127.0.0.1:3000/minigame_results?id=${id}&icao=${pos}&points=${points}`);
  
  setTimeout(() => {
    window.location.href = 'game.html';
  }, 1250);
  
  return results;
});

loadQuestion();