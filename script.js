let qIndex=0;
let streak=0;
let time=15;
let timerInterval=null;

function startTimer(){
    clearInterval(timerInterval);
    time=15;
    document.getElementById("timerNumber").innerText=time;
    timerInterval=setInterval(()=>{
        time--;
        document.getElementById("timerNumber").innerText=time;
        if(time<=0){
            clearInterval(timerInterval);
            resetGame();
        }
    },1000);
}

function loadQuestion(){
    let q=questions[qIndex];
    document.getElementById("questionBox").innerText=q.q;
    let ansDiv=document.getElementById("answers");
    ansDiv.innerHTML="";
    q.a.forEach((opt,i)=>{
        let b=document.createElement("button");
        b.innerText=opt;
        b.onclick=()=>check(i===q.c);
        ansDiv.appendChild(b);
    });
    startTimer();
}

function check(correct){
    clearInterval(timerInterval);
    if(correct){
        streak++;
        if(streak===5){
            alert("تبریک! ۵ پاسخ صحیح پیاپی!");
            resetGame();
            return;
        }
    } else {
        streak=0;
    }
    qIndex=(qIndex+1)%questions.length;
    loadQuestion();
}

function resetGame(){
    streak=0;
    qIndex=0;
    loadQuestion();
}

window.onload=()=>loadQuestion();
