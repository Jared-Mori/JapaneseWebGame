document.addEventListener("DOMContentLoaded", async function () {
    let data = await loadData("data.txt");
    let questionSet = splitCounters(data);
    let selectedFilters = new Map();
    let Streak = 0;

    const scoreCounter = document.getElementById("score");
    
    const keys = Array.from(questionSet.keys());
    keys.forEach(key => {
        selectedFilters.set(key, true);
        setDropdown(key, questionSet, selectedFilters);
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
    let currentQuestion = loadAndDisplayQuestion(questionSet, selectedFilters);

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
                    currentQuestion = loadAndDisplayQuestion(questionSet, selectedFilters);
                    answerInput.value = "";
                    Streak++;
                    scoreCounter.textContent = "Score: ", Streak;
                } else {
                    answerInput.classList.add("shake");
                    setTimeout(() => {
                        answerInput.classList.remove("shake");
                        Streak = 0;
                        scoreCounter.textContent = "Score: ", Streak;
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

function loadAndDisplayQuestion(counterMap, filters) {
    const questionParagraph = document.getElementById("question");
    const question = loadQuestion(counterMap, filters);
    questionParagraph.textContent = formatQuestion(question); // Update the paragraph content
    return question;
}

function loadQuestion(counterMap, filters) {
    console.log("Filters:", filters);
    const keys = [];
    filters.forEach((key, value) => {
        console.log("Key:", key);
        if (key) {
            keys.push(value);
        }
    });
    console.log("Keys:", keys);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const questions = counterMap.get(randomKey);
    const randomQuestion = questions[1][Math.floor(Math.random() * questions[1].length)];
    return randomQuestion;
}

function formatQuestion(question) {
    return `${question.count} ${question.descriptions[Math.floor(Math.random() * question.descriptions.length)]}`;
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

function setDropdown(key, questions, filters) {
    const p = document.createElement('p');
    p.style.color = 'white';
    p.textContent = questions.get(key)[0];
    p.isActive = true;

    // Add event listener to toggle color on click and update filters
    p.addEventListener('click', function () {
        if (p.style.color === 'white') {
            p.style.color = 'gray'; // Toggle off color
            filters.set(key, false);
        } else {
            p.style.color = 'white'; // Toggle on color
            filters.set(key, true);
        }
        loadAndDisplayQuestion(questions, filters); // Reload questions based on filters
    });

    dropdown.appendChild(p);
}