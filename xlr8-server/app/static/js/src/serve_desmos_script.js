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
            y: rect.top + 1*rect.height / 8, // Vertical center of the element
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
    console.log(fileId);

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

        window.location.reload();
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

function logUserIn() {
    // First save everything
    if (isOwningUser === 1) {
        nameForm2 = document.getElementById('NameForm');
        editFileContent(fileId, JSON.stringify(calculator.getState()), nameForm2.value);
    } else {
        nameTxt2 = document.getElementById('NameTxt');
        editFileContent(fileId, JSON.stringify(calculator.getState()), nameTxt2.textContent);
    }

    window.location.href = `/login/render-login?file_id=${fileId}`;

}

async function logUserOut() {
    // First save everything
    if (isOwningUser === 1) {
        nameForm2 = document.getElementById('NameForm');
        editFileContent(fileId, JSON.stringify(calculator.getState()), nameForm2.value);
    } else {
        nameTxt2 = document.getElementById('NameTxt');
        editFileContent(fileId, JSON.stringify(calculator.getState()), nameTxt2.textContent);
    }

    const payload = {
        user_id: userId
    };

    fetch('/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Logged out!')
        window.location.href = `/user-dashboard/`
    })
    .catch(error => {
        console.error('Error:', error);
    });

    
}

// -----------------------------------------------------------------------

const body = document.body;
body.style.margin = '0px';
body.style.height = '100%'

const html = document.documentElement;
html.style.maxWidth = '100%';
html.style.maxHeight = '100%';
html.style.height = '100%';

const contentScript = document.getElementById('content-data');
const content = JSON.parse(contentScript.textContent);

const fileIdScript = document.getElementById('file-id');
const fileId = JSON.parse(fileIdScript.textContent);
console.log(fileId); // giving NaN

const userIdScript = document.getElementById('user-id');
const userId = JSON.parse(userIdScript.textContent);

const userScript = document.getElementById('user-name');
const userName = JSON.parse(userScript.textContent)

const api_container = document.getElementById('api_container');
api_container.style.width = '99.7vw';
api_container.style.height = 'calc(99.7vh - 50px)';
api_container.style.margin = '0px';
calculator.setState(content);

const header = document.getElementById('header');
header.style.height = '50px';
header.style.display = 'flex';
header.style.flexDirection = 'row';
header.style.justifyContent = 'left';
header.style.alignItems = 'center';
header.style.position ='relative';
header.style.gap = '5px';

const logo = document.createElement('div');
logo.style.width = '35px';
logo.style.height = '50px';
logo.innerText = 'xlr8';
logo.style.display = 'flex';
logo.style.alignItems = 'center';
logo.style.justifyContent = 'center';
logo.style.marginLeft = '20px';
logo.style.fontFamily = 'Arial, sans-serif';
logo.style.fontWeight = 'bold';
logo.style.fontSize = '20px';
header.appendChild(logo);

const pathLogo = document.createElement('div');
pathLogo.style.width = '20px';
pathLogo.style.height = '50px';
pathLogo.innerText = '/';
pathLogo.style.display = 'flex';
pathLogo.style.alignItems = 'center';
pathLogo.style.justifyContent = 'center';
pathLogo.style.fontFamily = 'Arial, sans-serif';
pathLogo.style.fontWeight = 'bold';
pathLogo.style.fontSize = '20px';
header.appendChild(pathLogo);

const saveButton = document.createElement('button');



// Allow the file name to be changed only by the owning user
const isOwningUser = parseInt(document.getElementById("is-owning-user").textContent, 10);
if (isOwningUser === 1) {
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameForm.value);
    const nameScript = document.getElementById('file-name');
    const fileName = JSON.parse(nameScript.textContent);
    const nameForm = document.createElement('input');
    nameForm.type = 'text';
    nameForm.value = fileName;
    nameForm.style.all = 'unset';
    nameForm.style.fontFamily = 'Arial, sans-serif';
    nameForm.style.fontSize = '18px';
    nameForm.setAttribute('spellcheck', 'false');
    nameForm.id = 'NameForm';

    function adjustInputWidth() {
        const charWidth = 10;
        const padding = 20;
        const contentLength = nameForm.value.length;
        const width = contentLength*charWidth + padding;
        if (width > 150) {
            nameForm.style.width = '150px';
        } else {
            nameForm.style.width = `${width}px`;
        }
    }

    adjustInputWidth();
    
    header.appendChild(nameForm);

    nameForm.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const result = changeFilename(nameForm.value);
            nameForm.value = result.file.name;
        }
        adjustInputWidth();
    });

    

} else {
    const nameScript = document.getElementById('file-name');
    const fileName = JSON.parse(nameScript.textContent);
    const nameTxt = document.createElement('p');
    nameTxt.textContent = fileName;
    nameTxt.style.width = '75px'
    nameTxt.id = 'NameTxt';
    header.appendChild(nameTxt);
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameTxt.textContent);
}

saveButton.style.all = 'unset';
saveButton.style.marginLeft = '5px';
saveButton.style.marginRight = '5px';
saveButton.style.display = 'inline-block';
saveButton.style.width = '40px';
saveButton.style.height = '40px';
saveButton.style.display = 'flex';
saveButton.style.color = '#AAA'
saveButton.style.borderRadius = '10px';
saveButton.style.justifyContent = 'center';
saveButton.style.alignItems = 'center';
saveButton.classList.add("logo-button");
saveButton.style.cursor = 'pointer';

const savePopup = document.createElement('div');
saveButton.addEventListener("mouseenter", () => {
    setTimeout( () => {
        const saveButtonRect = saveButton.getBoundingClientRect(); 
        saveButton.style.backgroundColor = "#AAA";
        saveButton.style.color = "#444"
        savePopup.style.position = 'absolute';
        savePopup.style.top = `${saveButtonRect.top + 48}px`;
        console.log(`${saveButtonRect.right}`)
        savePopup.style.left = `${saveButtonRect.left - 20}px`;
        savePopup.style.width = '80px';
        savePopup.style.height = '28px';
        savePopup.style.borderRadius = '7px';
        savePopup.style.backgroundColor = '#000';
        savePopup.innerText = 'force save';
        savePopup.style.color = '#FFF';
        savePopup.style.fontSize = '14px';
        savePopup.style.display = 'flex';
        savePopup.style.alignItems = 'center';
        savePopup.style.fontFamily = 'Arial, sans-serif';
        savePopup.style.justifyContent = 'center';
        
        const triangle = document.createElement('div');
        triangle.style.position = 'absolute';
        triangle.style.width = '0';
        triangle.style.height = '0';
        triangle.style.borderLeft = '5px solid transparent';
        triangle.style.borderRight = '5px solid transparent';
        triangle.style.borderBottom = '5px solid #000';
        triangle.style.top = '-5px';
        triangle.style.left = '50%';
        triangle.style.transform = 'translateX(-50%)';
        document.body.appendChild(savePopup);
        savePopup.appendChild(triangle);
        
    }, 0);
});
saveButton.addEventListener("mousedown", () => {
    saveButton.style.backgroundColor = '#FFF';
});
saveButton.addEventListener("mouseup", () => {
    saveButton.style.backgroundColor = '#AAA';
});

saveButton.addEventListener("mouseleave", () => {
    saveButton.style.backgroundColor = "";
    saveButton.style.color = "#AAA";
    setTimeout(() =>{document.body.removeChild(savePopup)}, 0);
});

header.appendChild(saveButton);

const icon = document.createElement('i');
icon.classList.add('fas', 'fa-arrow-up');

saveButton.appendChild(icon);

// Display who is accessing the file (for debugging & user context;
// can also attach a link to this thing later)
userNameContainer = document.createElement('button');
userNameContainer.style.all = 'unset';
if (userName === "BAD_USERNAME_#$&^%") {
    rightArrow = document.createElement('i');
    rightArrow.classList.add('fas', 'fa-arrow-right');
    userNameContainer.appendChild(rightArrow);
    userNameContainer.style.width = '40px';
    userNameContainer.style.height = '40px';
    userNameContainer.style.color = '#AAA';
    userNameContainer.style.display = 'flex';
    userNameContainer.style.alignItems = 'center';
    userNameContainer.style.justifyContent = 'center';
    userNameContainer.style.borderRadius = '10px';
    userNameContainer.style.cursor = 'pointer';
    const savePopup2 = document.createElement('div');
    userNameContainer.onclick = () => logUserIn();
    userNameContainer.addEventListener('mouseenter', () => {
        const userButtonRect = userNameContainer.getBoundingClientRect(); 
        userNameContainer.style.backgroundColor = '#AAA';
        userNameContainer.style.color = '#444';
        savePopup2.style.position = 'absolute';
        savePopup2.style.top = `${userButtonRect.top + 48}px`;
        
        savePopup2.style.left = `${userButtonRect.left - 10}px`;
        savePopup2.style.width = '60px';
        savePopup2.style.height = '28px';
        savePopup2.style.borderRadius = '7px';
        savePopup2.style.backgroundColor = '#000';
        savePopup2.innerText = 'log in';
        savePopup2.style.color = '#FFF';
        savePopup2.style.fontSize = '14px';
        savePopup2.style.display = 'flex';
        savePopup2.style.alignItems = 'center';
        savePopup2.style.fontFamily = 'Arial, sans-serif';
        savePopup2.style.justifyContent = 'center';
        
        const triangle2 = document.createElement('div');
        triangle2.style.position = 'absolute';
        triangle2.style.width = '0';
        triangle2.style.height = '0';
        triangle2.style.borderLeft = '5px solid transparent';
        triangle2.style.borderRight = '5px solid transparent';
        triangle2.style.borderBottom = '5px solid #000';
        triangle2.style.top = '-5px';
        triangle2.style.left = '50%';
        triangle2.style.transform = 'translateX(-50%)';
        document.body.appendChild(savePopup2);
        savePopup2.appendChild(triangle2);
    });

    userNameContainer.addEventListener("mousedown", () => {
        userNameContainer.style.backgroundColor = '#FFF';
    });
    userNameContainer.addEventListener("mouseup", () => {
        userNameContainer.style.backgroundColor = '#AAA';
    });

    userNameContainer.addEventListener('mouseleave', () => {
        userNameContainer.style.backgroundColor = "";
        userNameContainer.style.color = "#AAA";
        setTimeout(() =>{document.body.removeChild(savePopup2)}, 0);
    });


} else {
    rightArrow = document.createElement('i');
    rightArrow.classList.add('fas', 'fa-arrow-right');
    userNameContainer.appendChild(rightArrow);
    userNameContainer.style.width = '40px';
    userNameContainer.style.height = '40px';
    userNameContainer.style.color = '#AAA';
    userNameContainer.style.display = 'flex';
    userNameContainer.style.alignItems = 'center';
    userNameContainer.style.justifyContent = 'center';
    userNameContainer.style.borderRadius = '10px';
    userNameContainer.style.cursor = 'pointer';
    const savePopup2 = document.createElement('div');
    userNameContainer.onclick = () => logUserOut();
    userNameContainer.addEventListener('mouseenter', () => {
        const userButtonRect = userNameContainer.getBoundingClientRect(); 
        userNameContainer.style.backgroundColor = '#AAA';
        userNameContainer.style.color = '#444';
        savePopup2.style.position = 'absolute';
        savePopup2.style.top = `${userButtonRect.top + 48}px`;
        
        savePopup2.style.left = `${userButtonRect.left - 10}px`;
        savePopup2.style.width = '60px';
        savePopup2.style.height = '28px';
        savePopup2.style.borderRadius = '7px';
        savePopup2.style.backgroundColor = '#000';
        savePopup2.innerText = 'log out';
        savePopup2.style.color = '#FFF';
        savePopup2.style.fontSize = '14px';
        savePopup2.style.display = 'flex';
        savePopup2.style.alignItems = 'center';
        savePopup2.style.fontFamily = 'Arial, sans-serif';
        savePopup2.style.justifyContent = 'center';
        
        const triangle2 = document.createElement('div');
        triangle2.style.position = 'absolute';
        triangle2.style.width = '0';
        triangle2.style.height = '0';
        triangle2.style.borderLeft = '5px solid transparent';
        triangle2.style.borderRight = '5px solid transparent';
        triangle2.style.borderBottom = '5px solid #000';
        triangle2.style.top = '-5px';
        triangle2.style.left = '50%';
        triangle2.style.transform = 'translateX(-50%)';
        document.body.appendChild(savePopup2);
        savePopup2.appendChild(triangle2);
    });

    userNameContainer.addEventListener("mousedown", () => {
        userNameContainer.style.backgroundColor = '#FFF';
    });
    userNameContainer.addEventListener("mouseup", () => {
        userNameContainer.style.backgroundColor = '#AAA';
    });

    userNameContainer.addEventListener('mouseleave', () => {
        userNameContainer.style.backgroundColor = "";
        userNameContainer.style.color = "#AAA";
        setTimeout(() =>{document.body.removeChild(savePopup2)}, 0);
    });

}
header.appendChild(userNameContainer);

const socket = io('http://localhost:5000');
console.log(`User ID: ${userId}, File ID: ${fileId}`);
socket.emit('join', { file_id: fileId, user_id: `User${userId}` });

socket.on('state_update', (data) => {
    console.log('Received state update:', data);

    if (data.user_id === `User${userId}`) {
        console.log('Ignoring self-originated update');
        return;
    }

    // Apply the update directly
    applyStateUpdate(data.state);
});

calculator.observeEvent("change", () => {
    console.log("User is typing...");
    isUserTyping = true;

    clearTimeout(typingTimeout); // Reset the debounce timer
    typingTimeout = setTimeout(() => {
        isUserTyping = false; // User has stopped typing
        console.log("User stopped typing");
        emitStateUpdate(); // Emit the state after typing stops
    }, 1000); // Debounce delay (adjust as needed)
});

// Monitor calculator state for changes and emit them
calculator.observeEvent('change', emitStateUpdate);
