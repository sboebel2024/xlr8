async function logUserOut(userId) {

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

function logUserIn() {
    window.location.href = `/login/render-login`;
}

function linkToDashboard() {
    window.location.href = '/user-dashboard/'
}

function adjustInputWidth(form) {
    const charWidth = 10;
    const padding = 20;
    const contentLength = form.value.length;
    const width = contentLength*charWidth + padding;
    if (width > 150) {
        form.style.width = '150px';
    } else {
        form.style.width = `${width}px`;
    }
}

async function getExtensions() {
    try  {
        const response = await fetch('/user-dashboard/get-extensions', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if(!response.ok) {
            //throw new Error(`Error: ${response.status} - ${response.statusText}`);
            return { error: `Error: ${response.status}` };
        }

        const data = await response.json();

        return data.extensions;

    } catch (error) {
        console.error('Error grabbing code:', error);
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

function onSpecificClassAdded(element, className, callback) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                if (element.classList.contains(className)) {
                    callback();
                    observer.disconnect();  // Stop observing once class is found
                }
            }
        });
    });

    observer.observe(element, { attributes: true });

    return observer;  // Return observer in case you need to disconnect it manually later
}

function addClassToChildren(element, className) {
    if (!element || !element.children) {
        console.warn("Invalid element provided.");
        return;
    }

    // Loop through all child elements and add the class
    for (let child of element.children) {
        child.classList.add(className);
    }
}

function watchClassRemoval(element, className, callback) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                if (!element.classList.contains(className)) {
                    callback();
                    observer.disconnect();  // Stop observing after removal
                }
            }
        });
    });

    observer.observe(element, { attributes: true });
}

async function togglePublicity(file) {
    try {
        payload = {
            file_id: file.id
        }
        response = await fetch('/org-dashboard/toggle-publicity', {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Successful:', result);
        } else {
            console.error('Error:', result.message);
        }
        
        if (result.isVisible === 'False') {
            return false;
        }

        if (result.isVisible === 'True') {
            return true;
        }

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { status: 'NOK', message: 'An unexpected error occurred' };
    }
}

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

async function editFileContentOvlf(fileId, newContent, newFileName, fileType, newOwnerId = null) {
    const url = '/user-dashboard/edit-file-content';
    const payload = {
        file_id: fileId,
        content: newContent,
        newFileName: `${newFileName}.${fileType}`
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