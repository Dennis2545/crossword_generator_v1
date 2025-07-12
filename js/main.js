// === js/main.js ===
import { CrosswordGenerator } from './grid_algorithm.js';
import { exportToPDF } from './pdf_generator.js';
import { renderGrid, renderClues } from './dom_controller.js';

const generator = new CrosswordGenerator();

function showStatus(msg, type = 'info') {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = `status ${type}`;
}

function showLoading(show = true) {
    const loading = document.getElementById("loading");
    loading.classList.toggle("show", show);
}

window.generateCrossword = function () {
    const rawInput = document.getElementById("wordsInput").value;
    const entries = generator.parseInput(rawInput);

    if (entries.length < 10) {
        showStatus("Please enter at least 10 valid entries.", "error");
        return;
    }

    showLoading(true);
    showStatus("Generating crossword...");

    setTimeout(() => {
        const success = generator.generateCrossword(entries);
        if (success) {
            renderGrid(generator);
            renderClues(generator);
            showStatus(`Crossword generated with ${generator.placedWords.length} words.`, "success");
        } else {
            showStatus("Generation failed. Try different words.", "error");
        }
        showLoading(false);
    }, 300);
};

window.exportToPDF = function () {
    if (generator.placedWords.length === 0) {
        showStatus("Generate a crossword first.", "error");
        return;
    }

    const title = document.getElementById("puzzleTitle").value;
    const fact = document.getElementById("funFact").value;
    showStatus("Exporting PDF...", "info");
    showLoading(true);

    exportToPDF(generator, title, fact)
        .then(() => showStatus("PDF exported successfully!", "success"))
        .catch(() => showStatus("Failed to export PDF.", "error"))
        .finally(() => showLoading(false));
};

document.addEventListener("DOMContentLoaded", () => {
    showStatus("Ready to generate your crossword!");
});
