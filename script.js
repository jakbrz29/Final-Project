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
const answerButtons = document.querySelectorAll(".multiple-choice");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timerDisplay = document.getElementById("timer");

// stats UI
const gamesPlayedDisplay = document.getElementById("games-played");
const correctDisplay = document.getElementById("correct-answers");
const wrongDisplay = document.getElementById("wrong-answers");
const accuracyDisplay = document.getElementById("accuracy");
const bestStreakDisplay = document.getElementById("best-streak");

// ==========================
// GAME STATE
// ==========================

let score = 0;
let highScore =
    parseInt(localStorage.getItem("highScore")) || 0;

let correctPokemon = "";
let gameStarted = false;
let roundAnswered = false;

let highScore = parseInt(localStorage.getItem("highScore")) || 0;

let selectedTime =
    parseInt(localStorage.getItem("timerLength")) || 60;

let timeLeft = selectedTime;
let timerInterval;

let currentStreak = 0;

let stats = JSON.parse(localStorage.getItem("pokemonStats")) || {
    gamesPlayed: 0,
    correct: 0,
    wrong: 0,
    bestStreak: 0,
};

// ==========================
// SETTINGS BUTTONS
// ==========================

const timer15Btn = document.getElementById("timer15");
const timer30Btn = document.getElementById("timer30");
const timer60Btn = document.getElementById("timer60");
const resetStatsBtn = document.getElementById("resetStats");

// timer selection
timer15Btn.addEventListener("click", () => {
    selectedTime = 15;
    localStorage.setItem("timerLength", 15);
    updateTimerButtons();
});

timer30Btn.addEventListener("click", () => {
    selectedTime = 30;
    localStorage.setItem("timerLength", 30);
    updateTimerButtons();
});

timer60Btn.addEventListener("click", () => {
    selectedTime = 60;
    localStorage.setItem("timerLength", 60);
    updateTimerButtons();
});

updateTimerButtons();

// reset stats
resetStatsBtn.addEventListener("click", () => {
    stats = {
        gamesPlayed: 0,
        correct: 0,
        wrong: 0,
        bestStreak: 0,
    };

    currentStreak = 0;
    highScore = 0;

    localStorage.removeItem("pokemonStats");
    localStorage.removeItem("highScore");

    saveStats();
    updateStatsDisplay();

    highScoreDisplay.textContent = 0;
});

// ==========================
// START BUTTON
// ==========================

startBtn.addEventListener("click", () => {
    if (!gameStarted) {

        gameStarted = true;

        score = 0;
        timeLeft = selectedTime;

        startBtn.textContent = "Next";
        resultText.textContent = "";

        startTimer();
        startRound();
    } else {
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

function updateTimerButtons() {
    timer15Btn.classList.remove("timer-selected");
    timer30Btn.classList.remove("timer-selected");
    timer60Btn.classList.remove("timer-selected");

    if (selectedTime === 15) timer15Btn.classList.add("timer-selected");
    if (selectedTime === 30) timer30Btn.classList.add("timer-selected");
    if (selectedTime === 60) timer60Btn.classList.add("timer-selected");
}

// ==========================
// START ROUND
// ==========================

async function startRound() {
    try {
        roundAnswered = false;

        answerButtons.forEach(btn => {
            btn.disabled = false;
        });

        resultText.textContent = "Loading...";

        const randomId = Math.floor(Math.random() * 151) + 1;

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );

        if (!response.ok) throw new Error("API failed");

        const data = await response.json();

        correctPokemon = data.name;

        image.src =
            data.sprites.other["official-artwork"].front_default;

        image.style.filter = "brightness(0)";

        let choices = [correctPokemon];

        while (choices.length < 4) {
            const fakeId = Math.floor(Math.random() * 151) + 1;

            const fakeRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${fakeId}`
            );

            const fakeData = await fakeRes.json();

            const fakeName = fakeData.name;

            if (!choices.includes(fakeName)) {
                choices.push(fakeName);
            }
        }

        choices.sort(() => Math.random() - 0.5);

        answerButtons.forEach((button, index) => {
            const name = choices[index];

            button.textContent = capitalize(name);
            button.onclick = () => checkAnswer(name);
        });

        resultText.textContent = "";

    } catch (error) {
        console.error(error);
        resultText.textContent = "Failed to load Pokémon.";
    }
}

// ==========================
// CHECK ANSWER
// ==========================

function checkAnswer(answer) {
    if (roundAnswered) return;

    roundAnswered = true;

    answerButtons.forEach(btn => btn.disabled = true);

    image.style.filter = "brightness(1)";

    if (roundAnswered) return;

    roundAnswered = true;

    if (answer === correctPokemon) {
        score++;
        stats.correct++;
        currentStreak++;

        if (currentStreak > stats.bestStreak) {
            stats.bestStreak = currentStreak;
        }

        resultText.textContent = "Correct!";
        resultText.className = "correct";

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreDisplay.textContent = highScore;
        }
    } else {
        stats.wrong++;
        currentStreak = 0;

        resultText.textContent = "Wrong!";
        resultText.className = "incorrect";

        image.style.filter = "brightness(1)";

        stats.wrong++;

        currentStreak = 0;

        saveStats();
        updateStatsDisplay();
    }

    saveStats();
    updateStatsDisplay();
    scoreDisplay.textContent = score;
}

// ==========================
// END GAME
// ==========================

function endGame() {
    gameStarted = false;

    stats.gamesPlayed++;

    startBtn.textContent = "Start";

    image.src = "questionmark.png";

    resultText.textContent = `Game Over! Final Score: ${score}`;
    resultText.className = "";

    answerButtons.forEach(button => {
        button.textContent = "";
        button.onclick = null;
    });

    saveStats();
    updateStatsDisplay();
}

// ==========================
// HELPERS
// ==========================

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// ==========================
// STORAGE
// ==========================

function saveStats() {
    localStorage.setItem("pokemonStats", JSON.stringify(stats));
}

function updateStatsDisplay() {
    gamesPlayedDisplay.textContent = stats.gamesPlayed;
    correctDisplay.textContent = stats.correct;
    wrongDisplay.textContent = stats.wrong;

    const total = stats.correct + stats.wrong;
    const accuracy = total === 0 ? 0 : Math.round((stats.correct / total) * 100);

    accuracyDisplay.textContent = accuracy + "%";
    bestStreakDisplay.textContent = stats.bestStreak;
}

updateStatsDisplay();
highScoreDisplay.textContent = highScore;
