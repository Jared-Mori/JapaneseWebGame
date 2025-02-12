document.addEventListener("DOMContentLoaded", async function () {
    let data = await loadData("data.txt");
    console.log("Data:", data);
    let questions = splitCounters(data);

    // Print the split data to the console for verification
    console.log("Split Questions Data:", questions);
    const keys = Array.from(questions.keys());
    keys.forEach(key => {
        setDropdown(questions.get(key)[0]);
    });

    // Get the answer input field
    const answerInput = document.getElementById("EngToJa");

    // Enable real-time romaji-to-hiragana conversion
    if (wanakana && wanakana.bind) {
        wanakana.bind(answerInput);
    } else {
        console.error("Wanakana failed to load.");
    }

    // Load a question when the page opens
    let currentQuestion = loadAndDisplayQuestion(questions);

    // Add event listener to the input field for 'Enter' key
    answerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            if (answerInput.value === "") {
                answerInput.classList.add("shake");
                setTimeout(() => {
                    answerInput.classList.remove("shake");
                }, 500);
            } else {
                if(checkAnswer(answerInput.value, currentQuestion)) {
                    currentQuestion = loadAndDisplayQuestion(questions);
                    answerInput.value = "";
                } else {
                    answerInput.classList.add("shake");
                    setTimeout(() => {
                        answerInput.classList.remove("shake");
                    }, 500);
                }
            }
        }
    });
});

// Function to load and parse the data file
async function loadData(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return parseData(text);
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// Function to parse the text data into a usable format
function parseData(text) {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);

    return lines.map(line => {
        const parts = line.split(" - ");
        if (parts.length === 3) {
            return {
                count: parseInt(parts[0], 10),
                descriptions: parts[1].split(","),
                answer: parts[2]
            };
        } else {
            console.warn("Skipping malformed line:", line);
            return null;
        }
    }).filter(item => item !== null);
}

function splitCounters(data) {
    const counterMap = new Map();
    let tempArray = [];

    data.forEach(question => {
        if (question.count === 0) {
            counterMap.set(question.descriptions[0], [question.answer, tempArray]);
            tempArray = [];
        } else {
            tempArray.push(question);
        }
    });

    return counterMap;
}

function loadQuestion(counterMap) {
    const keys = Array.from(counterMap.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const questions = counterMap.get(randomKey);
    const randomQuestion = questions[1][Math.floor(Math.random() * questions[1].length)];
    console.log("Random Question:", randomQuestion);
    return randomQuestion;
}

function formatQuestion(question) {
    return `${question.count} ${question.descriptions[Math.floor(Math.random() * question.descriptions.length)]}`;
}

function loadAndDisplayQuestion(questions) {
    const questionParagraph = document.getElementById("question");
    const question = loadQuestion(questions);
    questionParagraph.textContent = formatQuestion(question); // Update the paragraph content
    return question;
}

function checkAnswer(answer, question) {
    console.log("Checking answer:", answer);
    console.log("Checking against:", question.answer);
    if (wanakana.toKana(answer) === question.answer) {
        console.log("Correct!");
        return true;
    } else {
        console.log("Incorrect!");
        return false;
    }
}

// Function to add a new paragraph to the dropdown
function setDropdown(text) {
    const p = document.createElement('p');
    p.style.color = 'white';
    p.textContent = text;
    dropdown.appendChild(p);
}