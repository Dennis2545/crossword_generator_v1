// === js/dom_controller.js ===
export function renderGrid(generator) {
    const container = document.getElementById("crosswordContainer");
    container.innerHTML = "";
    const gridDiv = document.createElement("div");
    gridDiv.className = "crossword-grid";
    gridDiv.style.gridTemplateColumns = `repeat(${generator.size}, 1fr)`;

    for (let r = 0; r < generator.size; r++) {
        for (let c = 0; c < generator.size; c++) {
            const cell = document.createElement("div");
            cell.className = "crossword-cell";
            const val = generator.grid[r][c];

            if (val === "BLACK") {
                cell.classList.add("black");
            } else {
                cell.textContent = val;
                const number = generator.numbers[`${r},${c}`];
                if (number) {
                    const numberEl = document.createElement("span");
                    numberEl.className = "number";
                    numberEl.textContent = number;
                    cell.appendChild(numberEl);
                }
            }

            gridDiv.appendChild(cell);
        }
    }

    container.appendChild(gridDiv);
}

export function renderClues(generator) {
    const container = document.getElementById("clueContainer");
    container.innerHTML = "";

    const clueSection = document.createElement("div");
    clueSection.className = "clue-section";
    const title = document.createElement("h3");
    title.textContent = "Clues";
    clueSection.appendChild(title);

    const clueList = document.createElement("div");
    clueList.className = "clue-list";

    const createClueColumn = (label, clues) => {
        const col = document.createElement("div");
        col.className = "clue-column";
        const h4 = document.createElement("h4");
        h4.textContent = label;
        col.appendChild(h4);
        clues.forEach(clue => {
            const div = document.createElement("div");
            div.className = "clue-item";
            div.textContent = `${clue.number}. ${clue.clue}`;
            col.appendChild(div);
        });
        return col;
    };

    clueList.appendChild(createClueColumn("Across", generator.clues.across));
    clueList.appendChild(createClueColumn("Down", generator.clues.down));
    clueSection.appendChild(clueList);
    container.appendChild(clueSection);
}
