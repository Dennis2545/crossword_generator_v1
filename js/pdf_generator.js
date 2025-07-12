// === js/pdf_generator.js ===
export async function exportToPDF(generator, title, funFact) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    // Setup
    title = title || "The Sunday Crossword";
    funFact = funFact || "Fun Fact: The first crossword puzzle was called a 'Word-Cross' and appeared in 1913.";

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const innerMargin = 20;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // === PAGE 1: CLUES ===
    // ===BORDER FRAME ===
    // Outer border
    pdf.setLineWidth(3);
    pdf.setDrawColor(20, 20, 20);
    pdf.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10));
    
    // Inner decorative border
    pdf.setLineWidth(1);
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Corner decorations
    const cornerSize = 15;
    pdf.setLineWidth(2);
    pdf.setDrawColor(40, 40, 40);
    
    // Top-left corner
    pdf.line(margin + 5, margin + 5, margin + 5 + cornerSize, margin + 5);
    pdf.line(margin + 5, margin + 5, margin + 5, margin + 5 + cornerSize);
    
    // Top-right corner
    pdf.line(pageWidth - margin - 5 - cornerSize, margin + 5, pageWidth - margin - 5, margin + 5);
    pdf.line(pageWidth - margin - 5, margin + 5, pageWidth - margin - 5, margin + 5 + cornerSize);
    
    // Bottom-left corner
    pdf.line(margin + 5, pageHeight - margin - 5 - cornerSize, margin + 5, pageHeight - margin - 5);
    pdf.line(margin + 5, pageHeight - margin - 5, margin + 5 + cornerSize, pageHeight - margin - 5);
    
    // Bottom-right corner
    pdf.line(pageWidth - margin - 5 - cornerSize, pageHeight - margin - 5, pageWidth - margin - 5, pageHeight - margin - 5);
    pdf.line(pageWidth - margin - 5, pageHeight - margin - 5 - cornerSize, pageWidth - margin - 5, pageHeight - margin - 5);

    // === VINTAGE MAGAZINE HEADER ===
    let currentY = margin + 30;
    
    // Magazine masthead style
    pdf.setFont("times", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(20, 20, 20);
    pdf.text(title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    
    // Decorative underline
    const titleWidth = pdf.getTextWidth(title.toUpperCase());
    pdf.setLineWidth(2);
    pdf.setDrawColor(150, 100, 50);
    pdf.line(pageWidth / 2 - titleWidth / 2 - 20, currentY + 8, pageWidth / 2 + titleWidth / 2 + 20, currentY + 8);
    
    // Ornamental dots
    pdf.setFillColor(150, 100, 50);
    for (let i = 0; i < 5; i++) {
        const dotX = pageWidth / 2 - 40 + i * 20;
        pdf.circle(dotX, currentY + 20, 2, 'F');
    }
    
    currentY += 50;

    // === FACT BOX ===
    const factBoxY = currentY;
    const factBoxHeight = 45;
    
    // Fact box background
    pdf.setFillColor(248, 246, 240);
    pdf.setDrawColor(180, 160, 140);
    pdf.setLineWidth(1);
    pdf.rect(margin + innerMargin, factBoxY, pageWidth - 2 * (margin + innerMargin), factBoxHeight, 'FD');
    
    // Fun fact text
    pdf.setFont("times", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 60, 40);
    const factLines = pdf.splitTextToSize(funFact, pageWidth - 2 * (margin + innerMargin + 10));
    let factTextY = factBoxY + 18;
    for (const line of factLines) {
        pdf.text(line, pageWidth / 2, factTextY, { align: 'center' });
        factTextY += 12;
    }
    
    currentY = factBoxY + factBoxHeight + 25;

    // === CLUES SECTION ===
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text("CLUES", pageWidth / 2, currentY, { align: 'center' });
    
    pdf.setLineWidth(1);
    pdf.setDrawColor(180, 160, 140);
    pdf.line(margin + innerMargin, currentY + 8, pageWidth - margin - innerMargin, currentY + 8);
    
    currentY += 25;

    // Two-column layout
    const cluesColumnWidth = (pageWidth - 2 * (margin + innerMargin) - 25) / 2;
    const column1X = margin + innerMargin;
    const column2X = margin + innerMargin + cluesColumnWidth + 25;
    const cluesStartY = currentY;
    
    pdf.setLineWidth(1);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(column1X + cluesColumnWidth + 12, cluesStartY, column1X + cluesColumnWidth + 12, cluesStartY + 180);

    const renderClueColumn = (clues, title, x, startY) => {
        let y = startY;
        
        pdf.setFont("times", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(60, 40, 20);
        pdf.text(title, x, y);
        y += 18;
        
        pdf.setFont("times", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(40, 40, 40);
        
        clues.forEach(({ number, clue }) => {
            const fullText = `${number}. ${clue}`;
            const lines = pdf.splitTextToSize(fullText, cluesColumnWidth - 5);
            
            lines.forEach((line, index) => {
                if (index === 0) {
                    const numberPart = line.match(/^\d+\./);
                    if (numberPart) {
                        pdf.setFont("times", "bold");
                        pdf.text(numberPart[0], x, y);
                        const numberWidth = pdf.getTextWidth(numberPart[0]);
                        pdf.setFont("times", "normal");
                        pdf.text(line.substring(numberPart[0].length), x + numberWidth + 2, y);
                    } else {
                        pdf.text(line, x, y);
                    }
                } else {
                    pdf.text(line, x + 15, y);
                }
                y += 11;
            });
            y += 2;
        });
        
        return y;
    };

    const endY1 = renderClueColumn(generator.clues.across, "ACROSS", column1X, cluesStartY);
    const endY2 = renderClueColumn(generator.clues.down, "DOWN", column2X, cluesStartY);

    // Footer
    const footerY = Math.max(endY1, endY2) + 20;
    
    pdf.setLineWidth(1);
    pdf.setDrawColor(180, 160, 140);
    pdf.line(margin + innerMargin, footerY, pageWidth - margin - innerMargin, footerY);
    
    pdf.setFont("times", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(dateStr, pageWidth / 2, footerY + 15, { align: 'center' });

    // === PAGE 2: GRID ===
    pdf.addPage();
    
    // decorative border frame
    pdf.setLineWidth(3);
    pdf.setDrawColor(20, 20, 20);
    pdf.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10));
    
    pdf.setLineWidth(1);
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    pdf.setLineWidth(2);
    pdf.setDrawColor(40, 40, 40);
    pdf.line(margin + 5, margin + 5, margin + 5 + cornerSize, margin + 5);
    pdf.line(margin + 5, margin + 5, margin + 5, margin + 5 + cornerSize);
    pdf.line(pageWidth - margin - 5 - cornerSize, margin + 5, pageWidth - margin - 5, margin + 5);
    pdf.line(pageWidth - margin - 5, margin + 5, pageWidth - margin - 5, margin + 5 + cornerSize);
    pdf.line(margin + 5, pageHeight - margin - 5 - cornerSize, margin + 5, pageHeight - margin - 5);
    pdf.line(margin + 5, pageHeight - margin - 5, margin + 5 + cornerSize, pageHeight - margin - 5);
    pdf.line(pageWidth - margin - 5 - cornerSize, pageHeight - margin - 5, pageWidth - margin - 5, pageHeight - margin - 5);
    pdf.line(pageWidth - margin - 5, pageHeight - margin - 5 - cornerSize, pageWidth - margin - 5, pageHeight - margin - 5);

    // Header
    currentY = margin + 30;
    
    pdf.setFont("times", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(20, 20, 20);
    pdf.text(title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    
    pdf.setLineWidth(2);
    pdf.setDrawColor(150, 100, 50);
    pdf.line(pageWidth / 2 - titleWidth / 2 - 20, currentY + 8, pageWidth / 2 + titleWidth / 2 + 20, currentY + 8);
    
    pdf.setFillColor(150, 100, 50);
    for (let i = 0; i < 5; i++) {
        const dotX = pageWidth / 2 - 40 + i * 20;
        pdf.circle(dotX, currentY + 20, 2, 'F');
    }
    
    currentY += 70;

    // === GRID MARGINS ===
    const maxGridHeight = pageHeight - currentY - margin - 60;
    const maxGridWidth = pageWidth - 2 * margin - 60;
    const gridSize = Math.min(maxGridHeight, maxGridWidth, 500);
    const cellSize = gridSize / generator.size;
    const gridX = (pageWidth - gridSize) / 2;
    const gridY = currentY;
    
    // Shadow
    pdf.setFillColor(200, 200, 200);
    pdf.rect(gridX + 2, gridY + 2, gridSize, gridSize, 'F');
    
    // Main grid
    pdf.setLineWidth(2);
    pdf.setDrawColor(40, 40, 40);
    pdf.rect(gridX, gridY, gridSize, gridSize, 'D');

    // Draw cells
    for (let r = 0; r < generator.size; r++) {
        for (let c = 0; c < generator.size; c++) {
            const x = gridX + c * cellSize;
            const y = gridY + r * cellSize;
            const val = generator.grid[r][c];

            if (val === 'BLACK') {
                pdf.setFillColor(30, 30, 30);
                pdf.rect(x, y, cellSize, cellSize, 'F');
            } else {
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(120, 120, 120);
                pdf.setLineWidth(0.5);
                pdf.rect(x, y, cellSize, cellSize, 'FD');

                const number = generator.numbers[`${r},${c}`];
                if (number) {
                    pdf.setFont("times", "bold");
                    pdf.setFontSize(7);
                    pdf.setTextColor(50, 50, 50);
                    pdf.text(number.toString(), x + 2, y + 8);
                }
            }
        }
    }

    // Footer
    const gridFooterY = gridY + gridSize + 40;
    
    pdf.setLineWidth(1);
    pdf.setDrawColor(180, 160, 140);
    pdf.line(margin + innerMargin, gridFooterY, pageWidth - margin - innerMargin, gridFooterY);
    
    pdf.setFont("times", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(dateStr, pageWidth / 2, gridFooterY + 15, { align: 'center' });

    // Save
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_crossword.pdf`;
    pdf.save(filename);
}