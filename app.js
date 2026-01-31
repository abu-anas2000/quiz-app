let quizData = [];
const quizDiv = document.getElementById("quiz");
const submitBtn = document.getElementById("submitBtn");
const resultDiv = document.getElementById("result");

/* ================= LOAD QUESTIONS ================= */
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        quizData = data;
        renderQuiz();
    });

/* ================= RENDER QUIZ ================= */
function renderQuiz() {
    quizDiv.innerHTML = "";

    quizData.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `<h3>${index + 1}. ${q.question} (${q.points} pts)</h3>`;

        if (q.type === "truefalse") {
            div.innerHTML += `
                <label><input type="radio" name="q${index}" value="true"> True</label>
                <label><input type="radio" name="q${index}" value="false"> False</label>
            `;
        }

        if (q.type === "multiple") {
            q.options.forEach(opt => {
                div.innerHTML += `
                    <label>
                        <input type="radio" name="q${index}" value="${opt}">
                        ${opt}
                    </label>
                `;
            });
        }

        if (q.type === "fill") {
            div.innerHTML += `<input type="text" id="q${index}">`;
        }

        if (q.type === "matching") {
            Object.keys(q.pairs).forEach(key => {
                div.innerHTML += `
                    <div class="match-row">
                        <span>${key}</span>
                        <input type="text" id="q${index}_${key}">
                    </div>
                `;
            });
        }

        quizDiv.appendChild(div);
    });
}

/* ================= SUBMIT QUIZ ================= */
submitBtn.addEventListener("click", submitQuiz);

function submitQuiz() {
    let score = 0;
    let totalPoints = 0;

    quizData.forEach((q, index) => {
        totalPoints += q.points;

        if (q.type === "truefalse") {
            const ans = document.querySelector(`input[name="q${index}"]:checked`);
            if (ans && ans.value === q.answer.toString()) {
                score += q.points;
            }
        }

        if (q.type === "multiple") {
            const ans = document.querySelector(`input[name="q${index}"]:checked`);
            if (ans && ans.value === q.answer) {
                score += q.points;
            }
        }

        if (q.type === "fill") {
            const ans = document.getElementById(`q${index}`).value.trim();
            if (ans.toLowerCase() === q.answer.toLowerCase()) {
                score += q.points;
            }
        }

        /* ===== PARTIAL POINTS FOR MATCHING ===== */
        if (q.type === "matching") {
            const keys = Object.keys(q.pairs);
            const pointsPerMatch = q.points / keys.length;

            keys.forEach(key => {
                const userAnswer = document
                    .getElementById(`q${index}_${key}`)
                    .value.trim();

                if (userAnswer.toLowerCase() === q.pairs[key].toLowerCase()) {
                    score += pointsPerMatch;
                }
            });
        }
    });

    resultDiv.innerText = `Your Score: ${score.toFixed(2)} / ${totalPoints}`;
}
