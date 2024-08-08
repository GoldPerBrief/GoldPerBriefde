document.addEventListener('DOMContentLoaded', () => {
    const dialogueBox = document.getElementById('dialogue-box');
    const characterArt = document.getElementById('character-art');
    const dialogueText = document.getElementById('dialogue-text');

    let currentCharIndex = 0;
    let charDisplaySpeed = 50; // Default 20 chars per second
    let currentLineIndex = 0;
    let parsedLines = [];
    let timeoutDelay = 1000; // Default 1 second delay
    let interval;
    let newTextbox = false;
    let pauseParsing = false;
    let onDialogueComplete = null; // Callback for when dialogue finishes
    let waitForInput = false;
    let inputReminderTimeout;
    let isSkipping = false;

    const loadDialogueFile = async (url, callback = null) => {
        try {
            const response = await fetch(url);
            const dialogueData = await response.text();
            onDialogueComplete = callback;
            parseDialogue(dialogueData);
        } catch (error) {
            console.error("Error loading dialogue file:", error);
        }
    };

    const parseDialogue = (data) => {
        parsedLines = data.split('\n');
        currentLineIndex = 0; // Reset line index when new dialogue is loaded
        dialogueText.innerHTML = ""; // Clear previous dialogue
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
            case 'input':
                pauseParsing = true;
                waitForInput = true;
                inputReminderTimeout = setTimeout(showInputReminder, parseInt(value)); // Show reminder after 5 seconds
                break;
            // Add more control commands as needed
        }
    };

    const displayNextLine = () => {
        if (pauseParsing) return; // Do not display next line if parsing is paused

        if (currentLineIndex >= parsedLines.length) {
            if (onDialogueComplete) {
                onDialogueComplete(); // Call the callback function when dialogue finishes
            }
            return;
        }

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
        isSkipping = false;
        interval = setInterval(() => {
            if (isSkipping) {
                clearInterval(interval);
                dialogueText.innerHTML += line.slice(currentCharIndex) + '<br>';
                if (waitForInput) {
                    showInputReminder();
                } else {
                    displayNextLine();
                }
                return;
            }

            if (currentCharIndex < line.length) {
                dialogueText.innerHTML += line[currentCharIndex++];
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

    const skipToEndOfTextBox = () => {
        isSkipping = true;
        clearInterval(interval);

        while (currentLineIndex < parsedLines.length) {
            const line = parsedLines[currentLineIndex++];
            if (line.startsWith('@')) {
                handleControlCharacter(line);
                if (pauseParsing || newTextbox) break;
            } else {
                dialogueText.innerHTML += line + '<br>';
            }
        }

        if (waitForInput) {
            showInputReminder();
        } else if (!pauseParsing) {
            setTimeout(displayNextLine, charDisplaySpeed);
        }
    };

    const showInputReminder = () => {
        if (waitForInput) {
            dialogueText.innerHTML += '<br><small>(Press space or click to continue)</small>';
        }
    };

    const handlePlayerInput = () => {
        if (pauseParsing) {
            if (waitForInput) {
                clearTimeout(inputReminderTimeout);
                waitForInput = false;
                pauseParsing = false;
                dialogueText.innerHTML = dialogueText.innerHTML.replace('<br><small>(Press space or click to continue)</small>', '');
                displayNextLine();
            } else {
                skipToEndOfTextBox();
            }
        } else {
            skipToEndOfTextBox();
        }
    };

    document.addEventListener('click', handlePlayerInput);
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            handlePlayerInput();
        }
    });

    // Expose the loadDialogueFile function globally so it can be called from outside
    window.loadDialogue = loadDialogueFile;
});
