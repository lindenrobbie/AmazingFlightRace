let correctAnswer = Math.floor(Math.random() * 4);
let selectedAnswer = null;

document.querySelectorAll('.option-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedAnswer = parseInt(button.dataset.index);
    document.getElementById('confirm-btn').disabled = false;
  });
});

document.getElementById('confirm-btn').addEventListener('click', () => {
  if (selectedAnswer === null) return;

  const result = document.getElementById('result');
  if (selectedAnswer === correctAnswer) {
    result.textContent = "Oikein! ✅";
    result.style.color = "green";
  } else {
    result.textContent = "Väärin! ❌";
    result.style.color = "red";
  }

  document.getElementById('confirm-btn').disabled = true;
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
});