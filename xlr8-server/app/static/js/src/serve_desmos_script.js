// Make it so we can save multiple times per minute; or alternatively,
// write a loop listening for calculator.getState() changes and save after
// a certain volume of changes

class API {
    constructor(targetObject, setStateMethod, getStateMethod) {
        this.targetObject = targetObject;

        this.setState = (data) => {
            if (typeof this.targetObject[setStateMethod] === 'function') {
                this.targetObject[setStateMethod](data); // Call the dynamic setter
            } else {
                throw new Error(`Method ${setStateMethod} does not exist on the target object.`);
            }
        };

        this.getState = () => {
            if (typeof this.targetObject[getStateMethod] === 'function') {
                return this.targetObject[getStateMethod](); // Call the dynamic getter
            } else {
                throw new Error(`Method ${getStateMethod} does not exist on the target object.`);
            }
        };

    }
}

async function changeFilename(newName) {
    try {
        const sanitizedFileName = newName.replace(/[^a-zA-Z0-9_]/g, '');
        const newFileName = `${sanitizedFileName}.des`;

        const payload = {
            file_id: fileId,
            newFileName: newFileName
        };

        const response = await fetch('/user-dashboard/edit-file-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('File edited successfully:', result);
        } else {
            console.error('Error editing file:', result.message);
        }

        return result;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { status: 'NOK', message: 'An unexpected error occurred' };
    }
}

// Post route to handle talking to server
async function editFileContent(fileId, newContent, newFileName, newOwnerId = null) {
    const url = '/user-dashboard/edit-file-content';
    const payload = {
        file_id: fileId,
        content: newContent,
        newFileName: `${newFileName}.des`
    };

    // Add optional parameters if provided
    
    if (newOwnerId) {
        payload.newOwnerId = newOwnerId;
    } else {
        payload.newOwnerId = null;
    }

    try {
        // Send a POST request to the server
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Parse the JSON response
        const result = await response.json();

        // Handle the response
        if (response.ok) {
            console.log('File edited successfully:', result);
        } else {
            console.error('Error editing file:', result.message);
        }

        return result;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { status: 'NOK', message: 'An unexpected error occurred' };
    }
}

function highlightElement(element, userId) {
    element.style.border = '2px solid red';
    element.title = `Clicked by User ${userId}`;
    setTimeout(() => {
        element.style.border = '';
        element.title = '';
    }, 1000);
}

// Get content and script for every file
const contentScript = document.getElementById('content-data');
const content = JSON.parse(contentScript.textContent);

const fileId = parseInt(document.getElementById("file-id").textContent, 10);
const userId = parseInt(document.getElementById("user-id").textContent, 10);

const userScript = document.getElementById('user-name');
const userName = JSON.parse(userScript.textContent)

// Set the API container's styles.
const api_container = document.getElementById('api_container');
api_container.style.width = '100vw';
api_container.style.height = '95vh';

// -------------------------------- ONLY CHANGE THESE LINES ----------------------------------

calculator = Desmos.GraphingCalculator(document.getElementById('api_container'));



// -------------------------------------------------------------------------------------------

// Set state
calculator.setState(content);

// Set header stuff. Change this so it looks better for production!
const header = document.getElementById('header');
header.style.height = '5vh';
header.style.width = '100vh';

// Create the save button and equip it with the editFileContent method.
// Also, append it to the header for easy development access.
const saveButton = document.createElement('button');
saveButton.textContent = 'Save';

header.appendChild(saveButton);

const isOwningUser = parseInt(document.getElementById("is-owning-user").textContent, 10);
if (isOwningUser === 1) {
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameForm.value);
    const nameScript = document.getElementById('file-name');
    const fileName = JSON.parse(nameScript.textContent);
    const nameForm = document.createElement('input');
    nameForm.type = 'text';
    nameForm.value = fileName;
    header.appendChild(nameForm);

    nameForm.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const result = changeFilename(nameForm.value);
            nameForm.value = result.file.name;
        }
    });
} else {
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameTxT.textContent);
    const nameScript = document.getElementById('file-name');
    const fileName = JSON.parse(nameScript.textContent);
    const nameTxt = document.createElement('p');
    nameTxt.textContent = fileName;
    header.appendChild(nameTxt);
}

userNameP = document.createElement('p');
userNameP.textContent = `User: ${userName}`;
header.appendChild(userNameP);

const socket = io('http://localhost:5000');

console.log(`User ID: ${userId}, File ID: ${fileId}`);

socket.emit('join', { file_id: fileId, user_id: `User${userId}` });

let isUserTyping = false; // Track if the user is actively typing
let typingTimeout; // Timeout for debouncing emissions
let lastAppliedState = JSON.stringify(calculator.getState()); // Track last applied state
let lastEmittedState = JSON.stringify(calculator.getState()); // Track last emitted state
let focusedExpressionId = null;
let activeExpressionId = null;
let lastFocusedLocation = null;

socket.on('state_update', (data) => {
    console.log('Received state update:', data);

    if (data.user_id === `User${userId}`) {
        console.log('Ignoring self-originated update');
        return;
    }

    // Apply the update directly
    applyStateUpdate(data.state);
});

function simulateClick(delay = 0) {
    if (lastFocusedLocation) {
        setTimeout(() => {
            // Find the element at the stored location
            const targetElement = document.elementFromPoint(lastFocusedLocation.x, lastFocusedLocation.y);

            if (targetElement) {
                console.log("Restoring focus by clicking element at:", lastFocusedLocation);

                // Simulate full mouse interaction on the target element
                const mousedownEvent = new MouseEvent("mousedown", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: lastFocusedLocation.x,
                    clientY: lastFocusedLocation.y,
                });
                targetElement.dispatchEvent(mousedownEvent);

                const mouseupEvent = new MouseEvent("mouseup", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: lastFocusedLocation.x,
                    clientY: lastFocusedLocation.y,
                });
                targetElement.dispatchEvent(mouseupEvent);

                const clickEvent = new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: lastFocusedLocation.x,
                    clientY: lastFocusedLocation.y,
                });
                targetElement.dispatchEvent(clickEvent);

                console.log("Focus restored successfully.");
            } else {
                console.warn("No element found at the stored location.");
            }
        }, delay); // Delay to ensure the update has completed
    } else {
        console.warn("No location stored for restoring focus.");
    }
}

document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX; // X-coordinate of the cursor
    cursorY = event.clientY; // Y-coordinate of the cursor
    // console.log("Cursor position:", { x: cursorX, y: cursorY });
});

function captureFocusedElementLocation() {
    // Locate the element with the "dcg-selected" class
    const focusedElement = document.querySelector(".dcg-selected");

    if (focusedElement) {
        const rect = focusedElement.getBoundingClientRect(); // Get its bounding rectangle
        lastFocusedLocation = {
            x: rect.left + rect.width / 2, // Horizontal center of the element
            y: rect.top + rect.height / 2, // Vertical center of the element
        };
        console.log("Captured focused element location:", lastFocusedLocation);
    } else {
        lastFocusedLocation = null; // Reset if no element is focused
        console.warn("No focused element found to capture location.");
    }
}

function applyStateUpdate(newState) {
    if (isUserTyping) {
        console.log("User is typing, skipping state application");
        return; // Do not apply updates while the user is typing
    }

    captureFocusedElementLocation();

    const incomingExpressions = Array.isArray(newState.expressions?.list)
        ? newState.expressions.list
        : [];
    console.log("Incoming expressions:", incomingExpressions);

    const currentState = calculator.getState();
    const updatedState = {
        ...currentState, // Preserve other settings
        expressions: { list: incomingExpressions }, // Update expressions
    };

    const newStateString = JSON.stringify(updatedState);
    if (newStateString === lastAppliedState) {
        console.log("State unchanged, skipping update.");
        return;
    }

    calculator.setState(updatedState); // Apply the updated state
    lastAppliedState = newStateString; // Update last applied state
    
    simulateClick(0);

    console.log("Updated state successfully applied!");
}

calculator.observeEvent("change", () => {
    const expressions = calculator.getExpressions();
    const activeExpression = expressions.find(expr => expr.latex && expr.isEditing);

    if (activeExpression) {
        activeExpressionId = activeExpression.id; // Track the ID of the active expression
        console.log("User is typing in expression:", activeExpressionId);
    } else {
        activeExpressionId = null; // No active expression
    }
});

calculator.observeEvent("change", () => {
    console.log("User is typing...");
    isUserTyping = true;

    clearTimeout(typingTimeout); // Reset the debounce timer
    typingTimeout = setTimeout(() => {
        isUserTyping = false; // User has stopped typing
        console.log("User stopped typing");
        emitStateUpdate(); // Emit the state after typing stops
    }, 500); // Debounce delay (adjust as needed)
});

// Emit state changes to the server (throttled for performance)
function emitStateUpdate() {
    if (isUserTyping) {
        console.log("User is typing, skipping state emission");
        return; // Do not emit while the user is typing
    }

    const currentState = calculator.getState();
    const currentStateString = JSON.stringify(currentState);

    if (currentStateString !== lastEmittedState) {
        lastEmittedState = currentStateString; // Update last emitted state
        socket.emit("state_update", {
            file_id: fileId,
            user_id: `User${userId}`,
            state: currentState,
        });
        console.log("State emitted to server:", currentState);
    } else {
        console.log("State unchanged, not emitting.");
    }
}


// Monitor calculator state for changes and emit them
calculator.observeEvent('change', emitStateUpdate);
