
let currentIndex = 0;
let streak = 0;
let timer;
let timeLeft = 15;

const startBtn = document.getElementById("startBtn");
const quizBox = document.getElementById("quizBox");
const questionText = document.getElementById("questionText");
const choicesBox = document.getElementById("choicesBox");
const timerBar = document.getElementById("timerBar");
const winModal = document.getElementById("winModal");
const restartBtn = document.getElementById("restartBtn");

winModal.classList.add("hidden");

startBtn.onclick = () => {
    startBtn.classList.add("hidden");
    quizBox.classList.remove("hidden");
    streak = 0;
    loadQuestion();
};

function loadQuestion() {
    const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
    const q = QUESTIONS[randomIndex];

    questionText.textContent = q.q;
    choicesBox.innerHTML = "";

    q.choices.forEach((choice, i) => {
        const btn = document.createElement("div");
        btn.className = "choice";
        btn.textContent = choice;
        btn.onclick = () => selectAnswer(i, q.a);
        choicesBox.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 15;
    timerBar.style.width = "100%";

    timer = setInterval(() => {
        timeLeft--;
        timerBar.style.width = (timeLeft / 15) * 100 + "%";

        if (timeLeft <= 0) {
            clearInterval(timer);
            streak = 0;
            loadQuestion();
        }
    }, 1000);
}

function selectAnswer(i, correct) {
    clearInterval(timer);

    if (i === correct) {
        streak++;
        if (streak === 5) {
            showWinModal();
            return;
        }
    } else {
        streak = 0;
    }

    loadQuestion();
}

function showWinModal() {
    winModal.classList.remove("hidden");
    quizBox.classList.add("hidden");
}

restartBtn.onclick = () => {
    winModal.classList.add("hidden");
    quizBox.classList.remove("hidden");
    streak = 0;
    loadQuestion();
};
