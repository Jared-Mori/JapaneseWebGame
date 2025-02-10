document.addEventListener("DOMContentLoaded", async function () {
    let data = await loadData("data.txt");

    // Get the answer input field
    const answerInput = document.getElementById("answer");

    // Enable real-time romaji-to-hiragana conversion
    if (wanakana && wanakana.bind) {
        wanakana.bind(answerInput);
    } else {
        console.error("Wanakana failed to load.");
    }
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
                numeral: parts[0],
                description: parts[1],
                answer: parts[2]
            };
        } else {
            console.warn("Skipping malformed line:", line);
            return null;
        }
    }).filter(item => item !== null);
}
