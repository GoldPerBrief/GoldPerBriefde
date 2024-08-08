document.addEventListener('DOMContentLoaded', () => {
    const dialogueBox = document.getElementById('dialogue-box');
    const characterArt = document.getElementById('character-art');
    const dialogueText = document.getElementById('dialogue-text');

    let currentCharIndex = 0;
    let charDisplaySpeed = 50; // Default 20 chars per second
    let currentLineIndex = 0;
    let parsedLines = [];
    let timeoutDelay = 1000;
    let interval;
    let newTextbox = false;
    let pauseParsing = false;
    let onDialogueComplete = null; // Callback for when dialogue finishes
    let waitForInput = false;
    let inputReminderTimeout;
    let isSkipping = false;
    let dialogueCompleted = false; // Flag to track completion

    const loadDialogueFile = async (url, callback = null) => {
        try {
            const response = await fetch(url);
            const dialogueData = await response.text();
            onDialogueComplete = callback;
            dialogueCompleted = false; // Reset completion flag
            clearDialogue(); // Clear previous dialogue
            parseDialogue(dialogueData);
        } catch (error) {
            console.error("Error loading dialogue file:", error);
        }
    };

    const clearDialogue = () => {
        dialogueText.innerHTML = "";
        characterArt.src = ''; // Clear character art if needed
        // Ensure all state variables are reset if necessary
        currentCharIndex = 0;
        currentLineIndex = 0;
        parsedLines = [];
        clearInterval(interval);
        pauseParsing = false;
        isSkipping = false;
        waitForInput = false;
        dialogueCompleted = false;
        clearTimeout(inputReminderTimeout);
    };

        const clearDialogueNextBox = () => {
        dialogueText.innerHTML = "";
        characterArt.src = ''; // Clear character art if needed
        // Ensure all state variables are reset if necessary
        currentCharIndex = 0;
        clearInterval(interval);
        pauseParsing = false;
        isSkipping = false;
        waitForInput = false;
        dialogueCompleted = false;
        clearTimeout(inputReminderTimeout);
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
                console.log('speed set to ' + value);
                break;
            case 'image':
                characterArt.src = value;
                console.log('character image set to ' + value);
                break;
            case 'new-textbox':
            	console.log('displaying new textbox');
                clearInterval(interval);
                setTimeout(() => {
                    clearDialogueNextBox(); // Clear dialogue for the new textbox
                    newTextbox = false;
                    displayNextLine();
                }, timeoutDelay);
                newTextbox = true;
                break;
            case 'timeout-delay':
                timeoutDelay = parseInt(value, 10);
                console.log('timeoutDelay set to ' + value);
                break;
            case 'wait':
            	console.log('waiting for ' + value + 'ms');
                pauseParsing = true;
                setTimeout(() => {
                    pauseParsing = false;
                    displayNextLine();
                }, parseInt(value, 10));
                break;
            case 'input':
            	console.log("waitign for input with delay of " + value);
                pauseParsing = true;
                waitForInput = true;
                inputReminderTimeout = setTimeout(showInputReminder, parseInt(value, 10)); // Show reminder after 5 seconds
                break;
            case 'wait-ms':
				console.log('waiting for ' + value + 'ms');
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
    	if (dialogueCompleted) {
    		clearDialogue();
    		dialogueCompleted = true;
    	}
        if (pauseParsing || dialogueCompleted) return; // Do not display next line if parsing is paused or dialogue is completed

        console.log(currentLineIndex, parsedLines.length, parsedLines);
        if (currentLineIndex >= parsedLines.length) {
            if (!dialogueCompleted) {  // Ensure the callback is called only once
                dialogueCompleted = true;
                if (onDialogueComplete) {
                    onDialogueComplete(); // Call the callback function when dialogue finishes
                }
            }
            return;
        }

        const line = parsedLines[currentLineIndex++].trim();
        console.log('Displaying Line:', line); // Debugging
        if (line.startsWith('@')) {
            handleControlCharacter(line);
            if (!pauseParsing && !newTextbox) {
                displayNextLine(); // Handle control character and move to next line
            }
        } else if (line === '') {
            // Only add a line break if the previous line was not an empty line
            if (dialogueText.innerHTML !== '<br>') {
                dialogueText.innerHTML += '<br>'; // Add a line break for completely empty lines
            }
            displayNextLine(); // Continue to the next line
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
                dialogueText.innerHTML += line.slice(currentCharIndex) + '<br>'; // Add the remainder of the line and a line break
                displayNextLine();
                return;
            }

            if (currentCharIndex < line.length) {
                dialogueText.innerHTML += line[currentCharIndex++];
            } else {
                clearInterval(interval);
                if (currentLineIndex < parsedLines.length && parsedLines[currentLineIndex].trim() === '') {
                    dialogueText.innerHTML += '<br>'; // Add line break for an empty line
                    currentLineIndex++; // Skip the empty line
                }
                setTimeout(displayNextLine, charDisplaySpeed);
            }
        }, charDisplaySpeed);
    };

    const skipToEndOfTextBox = () => {
        isSkipping = true;
        clearInterval(interval);

        // Complete the current line
        if (currentCharIndex < parsedLines[currentLineIndex - 1].length) {
            const line = parsedLines[currentLineIndex - 1];
            dialogueText.innerHTML += line.slice(currentCharIndex);
        }

        while (currentLineIndex < parsedLines.length) {
            const line = parsedLines[currentLineIndex++].trim();
            if (line.startsWith('@')) {
                handleControlCharacter(line);
                if (pauseParsing || newTextbox) break;
            } else if (line === '') {
                // Only add a line break if not already added
                if (dialogueText.innerHTML !== '<br>') {
                    dialogueText.innerHTML += '<br>';
                }
            } else {
            	console.log(line);
                dialogueText.innerHTML += line; // Add the line with a line break
            }
        }

       if (!pauseParsing) {
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
