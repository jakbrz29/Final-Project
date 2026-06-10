// ==========================
// SIDEBARS
// ==========================

const howBtn = document.querySelector(".how-btn");
const settingsBtn = document.querySelector(".settings-btn");

const howSidebar = document.querySelector("#howToPlaySidebar");
const settingsSidebar = document.querySelector("#settingsSidebar");

const closeButtons = document.querySelectorAll(".close-btn");

howBtn.addEventListener("click", () => {
    howSidebar.classList.add("open");
});

settingsBtn.addEventListener("click", () => {
    settingsSidebar.classList.add("open");
});

closeButtons.forEach(button => {
    button.addEventListener("click", () => {
        howSidebar.classList.remove("open");
        settingsSidebar.classList.remove("open");
    });
});

// ==========================
// ELEMENTS
// ==========================

const resultText = document.getElementById("result-text");

const startBtn = document.querySelector("#start-btn");

const image = document.querySelector("#pokemon-image");

const answerButtons =
    document.querySelectorAll(".multiple-choice");

const scoreDisplay =
    document.getElementById("score");

const highScoreDisplay =
    document.getElementById("high-score");

const timerDisplay =
    document.getElementById("timer");

// ==========================
// GAME VARIABLES
// ==========================

let score = 0;
let highScore =
    parseInt(localStorage.getItem("highScore")) || 0;

let correctPokemon = "";

let gameStarted = false;
let roundAnswered = false;

let timeLeft = 60;
let timerInterval;

// Show saved high score
highScoreDisplay.textContent = highScore;

// ==========================
// START / NEXT BUTTON
// ==========================

startBtn.addEventListener("click", () => {

    if (!gameStarted) {

        gameStarted = true;

        score = 0;
        timeLeft = 60;

        startBtn.textContent = "Next";

        resultText.textContent = "";

        startTimer();
        startRound();
    }

    else {

        // Only penalize unanswered skips
        if (!roundAnswered) {
            score = Math.max(0, score - 1);
            scoreDisplay.textContent = score;
        }

        startRound();
    }
});

// ==========================
// TIMER
// ==========================

function startTimer() {

    clearInterval(timerInterval);

    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            endGame();
        }

    }, 1000);
}

// ==========================
// START ROUND
// ==========================

async function startRound() {

    roundAnswered = false;

    resultText.textContent = "";
    resultText.className = "";

    const randomId =
        Math.floor(Math.random() * 151) + 1;

    const response =
        await fetch(
            `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );

    const data =
        await response.json();

    correctPokemon = data.name;

    image.src =
        data.sprites.other["official-artwork"]
            .front_default;

    image.style.filter = "brightness(0)";

    let choices = [correctPokemon];

    while (choices.length < 4) {

        const fakeId =
            Math.floor(Math.random() * 151) + 1;

        const fakeResponse =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon/${fakeId}`
            );

        const fakeData =
            await fakeResponse.json();

        const fakePokemon =
            fakeData.name;

        if (!choices.includes(fakePokemon)) {
            choices.push(fakePokemon);
        }
    }

    choices.sort(() => Math.random() - 0.5);

    answerButtons.forEach((button, index) => {

        button.textContent =
            capitalize(choices[index]);

        button.onclick = () =>
            checkAnswer(choices[index]);
    });
}

// ==========================
// CHECK ANSWER
// ==========================

function checkAnswer(answer) {

    if (roundAnswered) return;

    roundAnswered = true;

    if (answer === correctPokemon) {

        score++;
        scoreDisplay.textContent = score;

        image.style.filter = "brightness(1)";

        resultText.textContent = "Correct!";
        resultText.className = "correct";

        // Save high score immediately
        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                "highScore",
                highScore
            );

            scoreText.textContent =
                `High Score: ${highScore}`;
        }
    }

    else {

        resultText.textContent = "Wrong!";
        resultText.className = "incorrect";

        image.style.filter = "brightness(1)";
    }
}

// ==========================
// GAME OVER
// ==========================

function endGame() {

    gameStarted = false;

    startBtn.textContent = "Start";

    image.src = "questionmark.png";

    resultText.textContent =
        `Game Over! Final Score: ${score}`;

    resultText.className = "";

    answerButtons.forEach(button => {

        button.textContent = "";

        button.onclick = null;
    });
}

// ==========================
// HELPER FUNCTION
// ==========================

function capitalize(word) {

    return word.charAt(0).toUpperCase() +
        word.slice(1);
}