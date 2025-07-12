// === js/grid_algorithm.js ===
export class CrosswordGenerator {
    constructor(size = 15) {
        this.size = size;
        this.grid = [];
        this.placedWords = [];
        this.clues = { across: [], down: [] };
        this.numbers = {};
        this.wordEntries = [];
        this.blackSquares = new Set();
    }

    parseInput(input) {
        const lines = input.trim().split('\n');
        const entries = [];
        for (const line of lines) {
            const [wordRaw, ...clueParts] = line.split(':');
            const word = wordRaw.trim().toUpperCase().replace(/[^A-Z]/g, '');
            const clue = clueParts.join(':').trim();
            if (word.length >= 3 && word.length <= this.size) {
                entries.push({ word, clue });
            }
        }
        return entries.slice(0, 50);
    }

    initializeGrid() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.placedWords = [];
        this.clues = { across: [], down: [] };
        this.numbers = {};
        this.blackSquares = new Set();
    }

    // Create symmetrical black square pattern
    createSymmetricalBlackSquares() {
        const center = Math.floor(this.size / 2);
        const blackPositions = [];
        
        // Add some strategic black squares for balance
        const patterns = [
            // Corner accents
            [1, 1], [1, this.size - 2], [this.size - 2, 1], [this.size - 2, this.size - 2],
            // Mid-edge blocks for separation
            [0, center], [this.size - 1, center], [center, 0], [center, this.size - 1],
            // Some internal structure
            [3, 3], [3, this.size - 4], [this.size - 4, 3], [this.size - 4, this.size - 4],
            [center - 2, center], [center + 2, center], [center, center - 2], [center, center + 2]
        ];

        // Only add black squares that don't interfere with placed words
        for (const [r, c] of patterns) {
            if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                if (this.grid[r][c] === null) {
                    // Add symmetrical pair
                    const symR = this.size - 1 - r;
                    const symC = this.size - 1 - c;
                    
                    if (this.grid[symR][symC] === null) {
                        this.blackSquares.add(`${r},${c}`);
                        this.blackSquares.add(`${symR},${symC}`);
                    }
                }
            }
        }
    }

    canPlaceWord(word, row, col, direction) {
        if (direction === 'across') {
            if (col + word.length > this.size) return false;
            
            // Check each position
            for (let i = 0; i < word.length; i++) {
                const cell = this.grid[row][col + i];
                const pos = `${row},${col + i}`;
                
                // Can't place on black squares
                if (this.blackSquares.has(pos)) return false;
                
                // Check letter compatibility
                if (cell !== null && cell !== word[i]) return false;
            }
            
            // Check word boundaries (before and after)
            if (col > 0) {
                const beforePos = `${row},${col - 1}`;
                if (!this.blackSquares.has(beforePos) && this.grid[row][col - 1] !== null) return false;
            }
            if (col + word.length < this.size) {
                const afterPos = `${row},${col + word.length}`;
                if (!this.blackSquares.has(afterPos) && this.grid[row][col + word.length] !== null) return false;
            }
            
        } else { // down
            if (row + word.length > this.size) return false;
            
            // Check each position
            for (let i = 0; i < word.length; i++) {
                const cell = this.grid[row + i][col];
                const pos = `${row + i},${col}`;
                
                // Can't place on black squares
                if (this.blackSquares.has(pos)) return false;
                
                // Check letter compatibility
                if (cell !== null && cell !== word[i]) return false;
            }
            
            // Check word boundaries (before and after)
            if (row > 0) {
                const beforePos = `${row - 1},${col}`;
                if (!this.blackSquares.has(beforePos) && this.grid[row - 1][col] !== null) return false;
            }
            if (row + word.length < this.size) {
                const afterPos = `${row + word.length},${col}`;
                if (!this.blackSquares.has(afterPos) && this.grid[row + word.length][col] !== null) return false;
            }
        }
        
        return true;
    }

    placeWord(word, row, col, direction, clue) {
        for (let i = 0; i < word.length; i++) {
            if (direction === 'across') {
                this.grid[row][col + i] = word[i];
            } else {
                this.grid[row + i][col] = word[i];
            }
        }
        this.placedWords.push({ word, row, col, direction, clue });
    }

    findIntersections(word) {
        const intersections = [];
        
        for (const placed of this.placedWords) {
            for (let i = 0; i < word.length; i++) {
                for (let j = 0; j < placed.word.length; j++) {
                    if (word[i] === placed.word[j]) {
                        if (placed.direction === 'across') {
                            // Place word vertically through horizontal word
                            const newRow = placed.row - i;
                            const newCol = placed.col + j;
                            if (newRow >= 0 && newRow + word.length <= this.size) {
                                intersections.push({ 
                                    row: newRow, 
                                    col: newCol, 
                                    direction: 'down',
                                    score: this.calculateIntersectionScore(word, newRow, newCol, 'down')
                                });
                            }
                        } else {
                            // Place word horizontally through vertical word
                            const newRow = placed.row + j;
                            const newCol = placed.col - i;
                            if (newCol >= 0 && newCol + word.length <= this.size) {
                                intersections.push({ 
                                    row: newRow, 
                                    col: newCol, 
                                    direction: 'across',
                                    score: this.calculateIntersectionScore(word, newRow, newCol, 'across')
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Sort by score (higher is better)
        return intersections.sort((a, b) => b.score - a.score);
    }

    calculateIntersectionScore(word, row, col, direction) {
        let score = 0;
        let intersections = 0;
        
        for (let i = 0; i < word.length; i++) {
            let r = row, c = col;
            if (direction === 'across') c += i;
            else r += i;

            if (r < 0 || r >= this.size || c < 0 || c >= this.size) return -1;
            
            const cell = this.grid[r][c];
            if (cell === word[i]) {
                score += 3; // Good intersection
                intersections++;
            } else if (cell !== null) {
                return -1; // Collision
            }
        }
        
        // Prefer words with multiple intersections
        if (intersections > 1) score += 5;
        if (intersections > 0) score += 2;
        
        return score;
    }

    generateCrossword(entries) {
        this.initializeGrid();
        this.wordEntries = entries;
        if (entries.length === 0) return false;

        // Sort words by length (longer first) for better placement
        entries.sort((a, b) => b.word.length - a.word.length);
        
        // Place first word in center
        const firstWord = entries[0];
        const startRow = Math.floor(this.size / 2);
        const startCol = Math.floor((this.size - firstWord.word.length) / 2);
        this.placeWord(firstWord.word, startRow, startCol, 'across', firstWord.clue);

        // Try to place remaining words with better algorithm
        for (let i = 1; i < entries.length; i++) {
            const entry = entries[i];
            const intersections = this.findIntersections(entry.word);
            let placed = false;

            // Try best intersections first
            for (const intersection of intersections) {
                if (this.canPlaceWord(entry.word, intersection.row, intersection.col, intersection.direction)) {
                    this.placeWord(entry.word, intersection.row, intersection.col, intersection.direction, entry.clue);
                    placed = true;
                    break;
                }
            }

            // If no intersection works, try strategic placement
            if (!placed) {
                const attempts = this.findStrategicPlacement(entry.word, entry.clue);
                if (attempts) placed = true;
            }
        }

        // Create symmetrical black squares after word placement
        this.createSymmetricalBlackSquares();
        this.fillBlackSquares();
        this.numberGrid();
        this.generateClues();
        
        return true;
    }

    findStrategicPlacement(word, clue) {
        const attempts = [];
        
        // Try different positions with some strategy
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                for (const direction of ['across', 'down']) {
                    if (this.canPlaceWord(word, row, col, direction)) {
                        // Calculate placement quality
                        const score = this.calculatePlacementScore(word, row, col, direction);
                        attempts.push({ row, col, direction, score });
                    }
                }
            }
        }
        
        // Sort by score and try best placement
        attempts.sort((a, b) => b.score - a.score);
        
        if (attempts.length > 0) {
            const best = attempts[0];
            this.placeWord(word, best.row, best.col, best.direction, clue);
            return true;
        }
        
        return false;
    }

    calculatePlacementScore(word, row, col, direction) {
        let score = 0;
        
        // Prefer central positions
        const centerRow = Math.floor(this.size / 2);
        const centerCol = Math.floor(this.size / 2);
        const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        score += Math.max(0, 15 - distanceFromCenter);
        
        // Check for potential future intersections
        for (let i = 0; i < word.length; i++) {
            let r = row, c = col;
            if (direction === 'across') c += i;
            else r += i;
            
            // Look for nearby letters that could create intersections
            const neighbors = [
                [r-1, c], [r+1, c], [r, c-1], [r, c+1]
            ];
            
            for (const [nr, nc] of neighbors) {
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    if (this.grid[nr][nc] === word[i]) {
                        score += 2; // Potential intersection
                    }
                }
            }
        }
        
        return score;
    }

    fillBlackSquares() {
        // Applying the symmetrical black squares to the grid
        for (const pos of this.blackSquares) {
            const [r, c] = pos.split(',').map(Number);
            if (this.grid[r][c] === null) {
                this.grid[r][c] = 'BLACK';
            }
        }
        
        // Fill remaining empty squares
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === null) {
                    this.grid[r][c] = 'BLACK';
                }
            }
        }
    }

    numberGrid() {
        let num = 1;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] !== 'BLACK') {
                    const isAcross = (c === 0 || this.grid[r][c - 1] === 'BLACK') &&
                                     (c + 1 < this.size && this.grid[r][c + 1] !== 'BLACK');
                    const isDown = (r === 0 || this.grid[r - 1][c] === 'BLACK') &&
                                   (r + 1 < this.size && this.grid[r + 1][c] !== 'BLACK');
                    if (isAcross || isDown) {
                        this.numbers[`${r},${c}`] = num++;
                    }
                }
            }
        }
    }

    generateClues() {
        for (const w of this.placedWords) {
            const key = `${w.row},${w.col}`;
            const number = this.numbers[key];
            if (!number) continue;
            const clue = { number, clue: w.clue };
            this.clues[w.direction].push(clue);
        }
        this.clues.across.sort((a, b) => a.number - b.number);
        this.clues.down.sort((a, b) => a.number - b.number);
    }
}