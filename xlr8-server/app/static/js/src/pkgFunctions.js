let socket;

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

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:3254");

    socket.onopen = () => {
        console.log("✅ WebSocket connected!");
        socket.send(JSON.stringify({ command: "whoami" })); // Example command
    };

    socket.onmessage = (event) => {
        console.log("📩 Proxy Response:", event.data);
    };

    socket.onclose = (event) => {
        console.warn("🔌 WebSocket disconnected. Reconnecting in 3s...");
        setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        socket.close();
    };
}


async function link_to_file(file_id, isDes) {
    const command = "python -X utf8 ";
    console.log(`Trying to open ${file_id}...`);
    if (isDes) {
        window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
    } else {
        console.log('Contacting proxy...');
        socket = new WebSocket("ws://localhost:3254");
        console.log('Proxy connected!');
        let response;
        try { 
            response = await fetch(`/user-dashboard/access-file?file_id=${file_id}`);

            if (!response.ok) {
                return { error: `Error: ${response.status}` };
            }

        } catch (error) {
            console.error("🚨 Fetch failed:", error);
        }

        const data = await response.json();

        const apiName = data.api;

        connectWebSocket();

        socket.onopen = async () => {
            try {
                console.log("✅ WebSocket connected!");
                
                let response = await fetch(`/get-apis?api=${apiName}`);
                if (!response.ok) throw new Error(`Http error! status: ${response.status}`);

                let scriptContent = await response.text();

                const encodedData = btoa(unescape(encodeURIComponent(scriptContent)));

                console.log("🔢 Encoded API Data:", encodedData);

                socket.send(JSON.stringify({
                    action: "upload",
                    filename: apiName,
                    content: encodedData
                }));
            } catch (error) {
                console.error("❌ Failed to fetch API:", error);
            }
        }
    

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
    
            console.log("📩 Proxy Response:", data);
        
            if (data.success) {
                console.log("✅ File uploaded successfully!");
        
                // 🔹 Execute the uploaded script
                setTimeout(() => {
                    socket.send(JSON.stringify({
                        command:  command + data.success.split("File saved at ")[1], // Get the uploaded path
                        password: "password"
                    }));
                }, 1000);
            }
        };

    }

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