// Make it so we can save multiple times per minute; or alternatively,
// write a loop listening for calculator.getState() changes and save after
// a certain volume of changes

calculator = Desmos.GraphingCalculator(document.getElementById('api_container'));

let isUserTyping = false; // Track if the user is actively typing
let typingTimeout; // Timeout for debouncing emissions
let lastAppliedState = JSON.stringify(calculator.getState()); // Track last applied state
let lastEmittedState = JSON.stringify(calculator.getState()); // Track last emitted state
let focusedExpressionId = null;
let lastFocusedLocation = null;
let lastScroll = null;
var loggingIn = false;

function simulateClick(delay = 0) {

    if (lastFocusedLocation) {

        setTimeout(() => {
            const targetElement = document.elementFromPoint(lastFocusedLocation.x, lastFocusedLocation.y);

            if (targetElement) {
                console.log("Restoring focus by clicking element at:", lastFocusedLocation);
                resetScroll();

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
                resetScroll();
            } else {
                console.warn("No element found at the stored location.");
            }
        }, delay); // Delay to ensure the update has completed
    } else {
        console.warn("No location stored for restoring focus.");
    }
}

function captureFocusedElementLocation() {
    // Locate the element with the "dcg-selected" class
    const focusedElement = document.querySelector(".dcg-selected");

    if (focusedElement) {
        const rect = focusedElement.getBoundingClientRect(); // Get its bounding rectangle
        lastFocusedLocation = {
            x: rect.left + 40, // Horizontal center of the element
            y: rect.top + rect.height / 2, // Vertical center of the element
        };
        const scrollElement = document.querySelector('.dcg-exppanel');
        console.log(`Scroll: ${scrollElement.scrollTop}`);
        console.log("Captured focused element location:", lastFocusedLocation);
    } else {
        lastFocusedLocation = null; // Reset if no element is focused
        console.warn("No focused element found to capture location.");
    }
}

function captureScrollElement() {
    const scrollElement = document.querySelector('.dcg-exppanel');
    lastScroll = scrollElement.scrollTop;
}

function resetScroll() {
    const scrollElement = document.querySelector('.dcg-exppanel');
    scrollElement.scrollTop = lastScroll;
    console.log(`Scroll Reset: ${lastScroll}`);

}

function applyStateUpdate(newState) {
    if (isUserTyping) {
        console.log("User is typing, skipping state application");
        return; // Do not apply updates while the user is typing
    }
    captureScrollElement();

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

    captureFocusedElementLocation();
    calculator.setState(updatedState); // Apply the updated state
    lastAppliedState = newStateString; // Update last applied state
    
    resetScroll();
    simulateClick(200);
    resetScroll();
    


    console.log("Updated state successfully applied!");
}

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

// Read in data from Jinja
const contentScript = document.getElementById('content-data');
const content = JSON.parse(contentScript.textContent);
const fileIdScript = document.getElementById('file-id');
const fileId = JSON.parse(fileIdScript.textContent);
const userIdScript = document.getElementById('user-id');
const userId = JSON.parse(userIdScript.textContent);
const userScript = document.getElementById('user-name');
const user_name = JSON.parse(userScript.textContent);
const nameScript = document.getElementById('file-name');
const fileName = JSON.parse(nameScript.textContent);

// Get rid of the margins
const body = document.body;
body.style.margin = '0px';
body.style.height = '100%';

// Get API Container from document
const api_container = document.getElementById('api_container');
styleApiContainer(api_container);

// Set initial state
calculator.setState(content);

// Render the header and associated things
const header = document.getElementById('header');
renderHeader(header);

// // Allow for an inverted screen
// container = document.querySelector('dcg-container');
// console.log(container);
// onSpecificClassAdded(container, '.dcg-inverted-colors', () => {

//     addClassToChildren(header, 'inverted-colors');
//     children = document.querySelectorAll('.inverted-colors');
//     for (let child of children) {
//         child.style.filter = 'invert(1)';
//     }
// });
// watchClassRemoval(container, 'dcg-inverted-colors', () => {
//     children = document.querySelectorAll('.inverted-colors');
//     for (let child of children) {
//         child.class.remove('inverted-colors');
//     }
// });

// Initialize the WebSocket
const socket = io('https://xlr8.online');
console.log(`User ID: ${userId}, File ID: ${fileId}`);
socket.emit('join', { file_id: fileId, user_id: `User${userId}` });

// WebSocket Receiver
socket.on('state_update', (data) => {
    console.log('Received state update:', data);

    if (data.user_id === `User${userId}`) {
        console.log('Ignoring self-originated update');
        return;  
    }
    if (loggingIn) {
        return;
    }
    applyStateUpdate(data.state);
});

document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX; // X-coordinate of the cursor
    cursorY = event.clientY; // Y-coordinate of the cursor
    // console.log("Cursor position:", { x: cursorX, y: cursorY });
});



calculator.observeEvent("change", () => {
    console.log("User is typing...");
    isUserTyping = true;

    clearTimeout(typingTimeout); // Reset the debounce timer
    typingTimeout = setTimeout(() => {
        isUserTyping = false; // User has stopped typing
        console.log("User stopped typing");
        emitStateUpdate(); // Emit the state after typing stops
    }, 2000); // Debounce delay
});

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

// Monitor calculator state for changes and emit them
calculator.observeEvent('change', emitStateUpdate);


