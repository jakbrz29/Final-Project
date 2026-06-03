// ==========================
// SIDEBARS
// ==========================

const howBtn = document.querySelector(".how-btn");
const settingsBtn = document.querySelector(".settings-btn");

const howSidebar =
    document.querySelector("#howToPlaySidebar");

const settingsSidebar =
    document.querySelector("#settingsSidebar");

const closeButtons =
    document.querySelectorAll(".close-btn");

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




const startBtn =
    document.querySelector("#start-btn");

const image =
    document.querySelector("#pokemon-image");

const answerButtons =
    document.querySelectorAll(".multiple-choice");

const scoreText =
    document.querySelector(".high-score p");

let score = 0;
let correctPokemon = "";


// ==========================
// START GAME
// ==========================

startBtn.addEventListener("click", startRound);

async function startRound() {

    
    const randomId =
        Math.floor(Math.random() * 151) + 1;

    
    const response =
        await fetch(
            `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );

    const data = await response.json();

    correctPokemon = data.name;

    // Pokemon image
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

    if (answer === correctPokemon) {

        score++;

        scoreText.textContent =
            `High Score: ${score}`;

        image.style.filter =
            "brightness(1)";

        alert("Correct!");
    }
    else {
        alert("Wrong!");
    }
}



function capitalize(word) {
    return word.charAt(0).toUpperCase()
        + word.slice(1);
}