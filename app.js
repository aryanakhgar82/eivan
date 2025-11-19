
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

startBtn.onclick = () => {
    startBtn.classList.add("hidden");
    quizBox.classList.remove("hidden");
    loadQuestion();
};

function loadQuestion() {
    const q = QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)];
    currentIndex = QUESTIONS.indexOf(q);

    questionText.textContent = q.q;
    choicesBox.innerHTML = "";

    q.choices.forEach((c,i)=>{
        let btn = document.createElement("div");
        btn.className="choice";
        btn.textContent=c;
        btn.onclick=()=>selectAnswer(i,q.a);
        choicesBox.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 15;
    timer = setInterval(()=>{
        timeLeft--;
        timerBar.style.width = (timeLeft/15*100)+"%";

        if (timeLeft <= 0) {
            clearInterval(timer);
            streak=0;
            loadQuestion();
        }
    },1000);
}

function selectAnswer(i, correct) {
    clearInterval(timer);
    if (i === correct) {
        streak++;
        if (streak === 5) {
            winModal.classList.remove("hidden");
            return;
        }
    } else {
        streak=0;
    }
    loadQuestion();
}

restartBtn.onclick = ()=>{
    winModal.classList.add("hidden");
    streak=0;
    loadQuestion();
};
