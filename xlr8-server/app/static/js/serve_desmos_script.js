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

// Get content and script for every file
const contentScript = document.getElementById('content-data');
const content = JSON.parse(contentScript.textContent);

const fileId = parseInt(document.getElementById("file-id").textContent, 10);

// Set the API container's styles.
const api_container = document.getElementById('api_container');
api_container.style.width = '100vw';
api_container.style.height = '95vh';

// -------------------------------- ONLY CHANGE THESE LINES ----------------------------------

api_instance = new API(Desmos.GraphingCalculator(document.getElementById('api_container')), 'setState', 'getState');



// -------------------------------------------------------------------------------------------

// Set state
api_instance.setState(content);

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
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(api_instance.getState()), nameForm.value);
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
    saveButton.onclick = () => editFileContent(fileId, JSON.stringify(api_instance.getState()), nameTxT.textContent);
    const nameScript = document.getElementById('file-name');
    const fileName = JSON.parse(nameScript.textContent);
    const nameTxt = document.createElement('p');
    nameTxt.textContent = fileName;
    header.appendChild(nameTxt);
}