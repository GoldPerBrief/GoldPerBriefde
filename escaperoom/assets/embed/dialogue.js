document.addEventListener('DOMContentLoaded', () => {
    const dialogueBox = document.getElementById('dialogue-box');
    const characterArt = document.getElementById('character-art');
    const dialogueText = document.getElementById('dialogue-text');

    let dialogueData = "";
    let currentCharIndex = 0;
    let charDisplaySpeed = 50; // Default 20 chars per second
    let currentLineIndex = 0;
    let parsedLines = [];
    let timeoutDelay = 1000; // Default 1 second delay
    let interval;
    let newTextbox = false;
    let pauseParsing = false;

    const loadDialogueFile = async (url) => {
        try {
            const response = await fetch(url);
            dialogueData = await response.text();
            parseDialogue(dialogueData);
        } catch (error) {
            console.error("Error loading dialogue file:", error);
        }
    };

    const parseDialogue = (data) => {
        parsedLines = data.split('\n');
        console.log('Parsed Lines:', parsedLines); // Debugging
        displayNextLine();
    };

    const handleControlCharacter = (command) => {
        const parts = command.slice(1).split(' ');
        const cmd = parts[0];
        const value = parts.slice(1).join(' ');
        console.log('Handling Control Character:', cmd, value); // Debugging
        switch (cmd) {
            case 'speed':
                charDisplaySpeed = 1000 / parseInt(value, 10);
                break;
            case 'image':
                characterArt.src = value;
                break;
            case 'new-textbox':
                clearInterval(interval);
                setTimeout(() => {
                    dialogueText.innerHTML = "";
                    newTextbox = false;
                    displayNextLine();
                }, timeoutDelay);
                newTextbox = true;
                break;
            case 'timeout-delay':
                timeoutDelay = parseInt(value, 10);
                break;
            case 'wait':
                pauseParsing = true;
                setTimeout(() => {
                    pauseParsing = false;
                    displayNextLine();
                }, parseInt(value, 10));
                break;
            // Add more control commands as needed
        }
    };

    const displayNextLine = () => {
        if (pauseParsing) return; // Do not display next line if parsing is paused

        if (currentLineIndex >= parsedLines.length) return;

        const line = parsedLines[currentLineIndex++];
        console.log('Displaying Line:', line); // Debugging
        if (line.startsWith('@')) {
            handleControlCharacter(line);
            if (!pauseParsing && !newTextbox) {
                displayNextLine(); // Handle control character and move to next line
            }
        } else {
            currentCharIndex = 0;
            typeLine(line);
        }
    };

    const typeLine = (line) => {
        interval = setInterval(() => {
            if (currentCharIndex < line.length) {
                if (line[currentCharIndex] === '@') {
                    clearInterval(interval);
                    const commandEndIndex = line.indexOf(' ', currentCharIndex);
                    const command = line.slice(currentCharIndex, commandEndIndex).trim();
                    handleControlCharacter(command);
                    currentCharIndex = commandEndIndex + 1;
                    typeLine(line); // Continue typing the line after handling the command
                } else {
                    dialogueText.innerHTML += line[currentCharIndex++];
                }
            } else {
                clearInterval(interval);
                if (currentLineIndex < parsedLines.length && parsedLines[currentLineIndex] === '') {
                    currentLineIndex++;
                    dialogueText.innerHTML += '<br>'; // Add newline for empty line
                }
                setTimeout(displayNextLine, charDisplaySpeed);
            }
        }, charDisplaySpeed);
    };

    // Replace 'dialogue.txt' with the path to your text file
    loadDialogueFile('assets/embed/dialogue.txt');
});
