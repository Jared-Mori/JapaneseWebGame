document.addEventListener("DOMContentLoaded", async function () {
    let data = await loadData("data.txt");
    let questions = splitCounters(data);

    // Print the split data to the console for verification
    console.log("Split Questions Data:", questions);

    // Get the answer input field
    const answerInput = document.getElementById("EngToJa");

    // Enable real-time romaji-to-hiragana conversion
    if (wanakana && wanakana.bind) {
        wanakana.bind(answerInput);
    } else {
        console.error("Wanakana failed to load.");
    }

    // Add event listener to the button
    const button = document.getElementById("loadQuestionButton");
    button.addEventListener("click", function () {
        const questionParagraph = document.getElementById("question");
        const question = loadQuestion(questions);
        questionParagraph.textContent = question.answer; // Update the paragraph content
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
            counterMap.set(question.descriptions[0], tempArray);
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
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return randomQuestion;
}