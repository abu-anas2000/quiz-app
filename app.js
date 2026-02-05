let quizData = [];
let currentQuestion = 0;
let studentName = "";
let answers = {};

const quizDiv = document.getElementById("quiz");
const resultDiv = document.getElementById("result");

const startBtn = document.getElementById("startQuiz");
const nameInput = document.getElementById("studentName");
const nameError = document.getElementById("nameError");

const quizArea = document.getElementById("quizArea");
const studentSection = document.getElementById("studentSection");

const subjectSelect = document.getElementById("subjectSelect");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

/* ================= START QUIZ ================= */

startBtn.addEventListener("click", () => {

    if (!nameInput.value.trim()) {
        nameError.innerText = "Student name is required!";
        return;
    }

    studentName = nameInput.value.trim();

    studentSection.style.display = "none";
    quizArea.style.display = "block";
});

/* ================= LOAD SUBJECT ================= */

subjectSelect.addEventListener("change", () => {

    fetch(`quizzes/${subjectSelect.value}.json`)
        .then(res => res.json())
        .then(data => {

            quizData = data;
            answers = {};
            currentQuestion = 0;

            showQuestion();

        });
});

/* ================= SHOW ONE QUESTION ================= */

function showQuestion() {

    const q = quizData[currentQuestion];

    let html = `<h3>${currentQuestion+1}. ${q.question} (${q.points} pts)</h3>`;

    if (q.type === "truefalse") {

        ["true","false"].forEach(val => {
            const checked = answers[currentQuestion] == val ? "checked":"";
            html += `<label><input type="radio" name="q" value="${val}" ${checked}> ${val}</label>`;
        });
    }

    if (q.type === "multiple") {

        q.options.forEach(opt => {
            const checked = answers[currentQuestion] == opt ? "checked":"";
            html += `<label><input type="radio" name="q" value="${opt}" ${checked}> ${opt}</label>`;
        });
    }

    if (q.type === "fill") {

        const val = answers[currentQuestion] || "";
        html += `<input type="text" id="fillInput" value="${val}">`;
    }

    if (q.type === "matching") {

        Object.keys(q.pairs).forEach(key => {

            const val = answers[currentQuestion]?.[key] || "";

            html += `
            <div class="match-row">
                <span>${key}</span>
                <input type="text" data-key="${key}" value="${val}">
            </div>`;
        });
    }

    quizDiv.innerHTML = html;
}

/* ================= SAVE ANSWER ================= */

function saveAnswer() {

    const q = quizData[currentQuestion];

    if (q.type === "truefalse" || q.type === "multiple") {

        const selected = document.querySelector('input[name="q"]:checked');
        if (selected) answers[currentQuestion] = selected.value;
    }

    if (q.type === "fill") {

        answers[currentQuestion] = document.getElementById("fillInput").value;
    }

    if (q.type === "matching") {

        let obj = {};

        document.querySelectorAll("[data-key]").forEach(input => {
            obj[input.dataset.key] = input.value;
        });

        answers[currentQuestion] = obj;
    }
}

/* ================= NAVIGATION ================= */

nextBtn.onclick = () => {

    saveAnswer();

    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        showQuestion();
    }
};

prevBtn.onclick = () => {

    saveAnswer();

    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
};

/* ================= SUBMIT QUIZ ================= */

submitBtn.onclick = () => {

    saveAnswer();

    let score = 0;
    let total = 0;

    quizData.forEach((q,index)=>{

        total += q.points;

        const ans = answers[index];

        if (!ans) return;

        if(q.type==="truefalse" && ans===q.answer.toString())
            score+=q.points;

        if(q.type==="multiple" && ans===q.answer)
            score+=q.points;

        if(q.type==="fill" && ans.toLowerCase()===q.answer.toLowerCase())
            score+=q.points;

        if(q.type==="matching"){

            const keys = Object.keys(q.pairs);
            const partial = q.points / keys.length;

            keys.forEach(k=>{
                if(ans[k]?.toLowerCase()===q.pairs[k].toLowerCase())
                    score+=partial;
            });
        }

    });

    resultDiv.innerHTML = `${studentName}, your score is ${score.toFixed(2)} / ${total}`;
};
