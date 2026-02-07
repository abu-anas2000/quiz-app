let quizData=[];
let answers={};
let current=0;
let student="";
let timerInterval;
let remainingTime=300; // seconds (5 minutes)

const startBtn=document.getElementById("startBtn");
const examSection=document.getElementById("examSection");
const startSection=document.getElementById("startSection");
const quizDiv=document.getElementById("quiz");
const resultDiv=document.getElementById("result");
const progress=document.getElementById("progress");
const questionNav=document.getElementById("questionNav");

/* START EXAM */

startBtn.onclick=()=>{

const name=document.getElementById("studentName").value.trim();
const subject=document.getElementById("subjectSelect").value;

if(!name || !subject){
document.getElementById("error").innerText="Enter name and subject";
return;
}

student=name;

fetch(`quizzes/${subject}.json`)
.then(r=>r.json())
.then(data=>{

quizData=data;

loadSaved();

startSection.style.display="none";
examSection.style.display="block";

createNav();
showQuestion();
startTimer();

});

};

/* TIMER */

function startTimer(){

timerInterval=setInterval(()=>{

remainingTime--;

document.getElementById("timer").innerText=`Time: ${remainingTime}s`;

if(remainingTime<=0){
clearInterval(timerInterval);
submitExam();
}

},1000);

}

/* NAV BUTTONS */

function createNav(){

questionNav.innerHTML="";

quizData.forEach((q,i)=>{

let btn=document.createElement("button");
btn.className="qbtn";
btn.innerText=i+1;

btn.onclick=()=>{
saveAnswer();
current=i;
showQuestion();
};

questionNav.appendChild(btn);

});

}

/* SHOW QUESTION */

function showQuestion(){

const q=quizData[current];

progress.innerText=`Question ${current+1} / ${quizData.length}`;

let html=`<h3>${q.question}</h3>`;




    /* MULTIPLE CHOICE */

if(q.type==="multiple"){

    q.options.forEach(opt => {

        const checked = answers[current] === opt ? "checked" : "";

        html += `
        <label>
            <input type="radio" name="q" value="${opt}" ${checked}>
            ${opt}
        </label>`;
    });
}




    
if(q.type==="truefalse"){
["true","false"].forEach(v=>{
html+=`<label><input type="radio" name="q" value="${v}" ${answers[current]==v?"checked":""}>${v}</label>`;
});
}

if(q.type==="multiple"){
q.options.forEach(opt=>{
html+=`<label><input type="radio" name="q" value="${opt}" ${answers[current]==opt?"checked":""}>${opt}</label>`;
});
}

if(q.type==="fill"){
html+=`<input id="fillInput" value="${answers[current]||""}">`;
}

if(q.type==="matching"){

    const leftItems = Object.keys(q.pairs);
    const rightItems = Object.values(q.pairs);

    // Shuffle dropdown options
    const shuffled = [...rightItems].sort(()=>Math.random()-0.5);

    leftItems.forEach(left => {

        const selectedValue = answers[current]?.[left] || "";

        html += `
        <div class="match-row">

            <span>${left}</span>

            <select data-key="${left}">
                <option value="">Select...</option>

                ${shuffled.map(opt => `
                    <option value="${opt}" ${selectedValue===opt?"selected":""}>
                        ${opt}
                    </option>
                `).join("")}

            </select>

        </div>`;
    });
}

quizDiv.innerHTML=html;

updateNavUI();

}

/* SAVE ANSWER */

function saveAnswer(){

const q=quizData[current];

if(q.type==="truefalse"||q.type==="multiple"){
const sel=document.querySelector('input[name="q"]:checked');
if(sel) answers[current]=sel.value;
}

if(q.type==="fill"){
answers[current]=document.getElementById("fillInput").value;
}

if(q.type==="matching"){
let obj={};
document.querySelectorAll("[data-key]").forEach(el=>{
obj[el.dataset.key]=el.value;
});
answers[current]=obj;
}

localStorage.setItem("examAnswers",JSON.stringify(answers));

}

/* LOAD SAVED */

function loadSaved(){

const saved=localStorage.getItem("examAnswers");
if(saved) answers=JSON.parse(saved);

}

/* NAVIGATION BUTTONS */

document.getElementById("nextBtn").onclick=()=>{
saveAnswer();
if(current<quizData.length-1){current++;showQuestion();}
};

document.getElementById("prevBtn").onclick=()=>{
saveAnswer();
if(current>0){current--;showQuestion();}
};

/* NAV UI */

function updateNavUI(){

document.querySelectorAll(".qbtn").forEach((btn,i)=>{

btn.classList.remove("current","answered");

if(i===current) btn.classList.add("current");

if(answers[i]) btn.classList.add("answered");

});

}

/* SUBMIT */

document.getElementById("submitBtn").onclick=submitExam;

function submitExam(){

saveAnswer();

clearInterval(timerInterval);

let score=0;
let total=0;

quizData.forEach((q,i)=>{

total+=q.points;

const ans=answers[i];

if(!ans) return;

if(q.type==="truefalse" && ans===q.answer.toString()) score+=q.points;

if(q.type==="multiple" && ans===q.answer) score+=q.points;

if(q.type==="fill" && ans.toLowerCase()===q.answer.toLowerCase()) score+=q.points;

if(q.type==="matching"){

const keys=Object.keys(q.pairs);
const partial=q.points/keys.length;

keys.forEach(k=>{
if(ans[k]?.toLowerCase()===q.pairs[k].toLowerCase())
score+=partial;
});

}

});

resultDiv.innerHTML=`${student}, Score: ${score.toFixed(2)} / ${total}`;

localStorage.removeItem("examAnswers");

}



