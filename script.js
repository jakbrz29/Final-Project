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

let selectedTime =
    parseInt(localStorage.getItem("timerLength"))
    || 60;

let timeLeft = selectedTime;
let timerInterval;


// Settings Buttons

const timer15Btn =
    document.getElementById("timer15");

const timer30Btn =
    document.getElementById("timer30");

const timer60Btn =
    document.getElementById("timer60");

const resetStatsBtn =
    document.getElementById("resetStats");


// Event Listeners

timer15Btn.addEventListener("click", () => {

    selectedTime = 15;

    localStorage.setItem(
        "timerLength",
        15
    );

    updateTimerButtons();
    console.log(selectedTime);
});

timer30Btn.addEventListener("click", () => {

    selectedTime = 30;

    localStorage.setItem(
        "timerLength",
        30
    );

    updateTimerButtons();
});

timer60Btn.addEventListener("click", () => {

    selectedTime = 60;

    localStorage.setItem(
        "timerLength",
        60
    );

    updateTimerButtons();
});

//show high score
highScoreDisplay.textContent = highScore;

//Stats variables

const gamesPlayedDisplay =
    document.getElementById("games-played");

const correctDisplay =
    document.getElementById("correct-answers");

const wrongDisplay =
    document.getElementById("wrong-answers");

const accuracyDisplay =
    document.getElementById("accuracy");

const bestStreakDisplay =
    document.getElementById("best-streak");


console.log("gamesPlayed:", gamesPlayedDisplay);
console.log("correct:", correctDisplay);
console.log("wrong:", wrongDisplay);
console.log("accuracy:", accuracyDisplay);
console.log("bestStreak:", bestStreakDisplay);

// ==========================
// START / NEXT BUTTON
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

//Timer Settings
function updateTimerButtons() {

    timer15Btn.classList.remove("timer-selected");
    timer30Btn.classList.remove("timer-selected");
    timer60Btn.classList.remove("timer-selected");

    if (selectedTime === 15) {
        timer15Btn.classList.add("timer-selected");
    }

    if (selectedTime === 30) {
        timer30Btn.classList.add("timer-selected");
    }

    if (selectedTime === 60) {
        timer60Btn.classList.add("timer-selected");
    }
}

updateTimerButtons(); 

    //Clear stats
    resetStatsBtn.addEventListener("click", () => {

    if (!confirm(
        "Clear all statistics and high scores?"
    )) {
        return;
    }

    stats = {
        gamesPlayed: 0,
        correct: 0,
        wrong: 0,
        bestStreak: 0
    };

    highScore = 0;

    localStorage.removeItem("pokemonStats");
    localStorage.removeItem("highScore");

    highScoreDisplay.textContent = 0;

    updateStatsDisplay();
});

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
        stats.correct++;

    currentStreak++;

    if (currentStreak > stats.bestStreak) {
    stats.bestStreak = currentStreak;
    }

    saveStats();
    updateStatsDisplay();
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

            highScoreDisplay.textContent = highScore;
        }
    }

    else {

        resultText.textContent = "Wrong!";
        resultText.className = "incorrect";

        image.style.filter = "brightness(1)";

        stats.wrong++;

        currentStreak = 0;

        saveStats();
        updateStatsDisplay();
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

        stats.gamesPlayed++;

    saveStats();
    updateStatsDisplay();
    });
}

// ==========================
// HELPER FUNCTION
// ==========================

function capitalize(word) {

    return word.charAt(0).toUpperCase() +
        word.slice(1);
}

//Stats Storage
let stats = JSON.parse(
    localStorage.getItem("pokemonStats")
) || {
    gamesPlayed: 0,
    correct: 0,
    wrong: 0,
    bestStreak: 0,
};

let currentStreak = 0;

function updateStatsDisplay() {

    console.log(gamesPlayedDisplay);
    console.log(correctDisplay);
    console.log(wrongDisplay);
    console.log(accuracyDisplay);
    console.log(bestStreakDisplay);

    if (!gamesPlayedDisplay ||
        !correctDisplay ||
        !wrongDisplay ||
        !accuracyDisplay ||
        !bestStreakDisplay) {

        console.error("One of the stat elements is missing.");
        return;
    }

    gamesPlayedDisplay.textContent =
        stats.gamesPlayed;

    correctDisplay.textContent =
        stats.correct;

    wrongDisplay.textContent =
        stats.wrong;

    const totalAnswers =
        stats.correct + stats.wrong;

    const accuracy =
        totalAnswers === 0
            ? 0
            : Math.round(
                (stats.correct / totalAnswers) * 100
            );

    accuracyDisplay.textContent =
        accuracy + "%";

    bestStreakDisplay.textContent =
        stats.bestStreak;
}

function saveStats() {

    localStorage.setItem(
        "pokemonStats",
        JSON.stringify(stats)
    );
}


updateStatsDisplay();
