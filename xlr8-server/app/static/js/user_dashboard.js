
async function fetchFileData(isCards) {
    try {
        const requestData = {
            isCards: isCards
        };
        const response = await fetch('/user-dashboard/get-file-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if(!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const fileData = await response.json();
        console.log('File Data', fileData);
        return fileData
    } catch (error) {
        console.error('Error fetching file data:', error);
    }
}

async function createFile(type, fileName) {
    // CHANGE THIS --> get from dictionary in models
    if (type === 'des') {
        try {
            const requestBody = {
                fileName: fileName,
                content: ""
            };

            const response = await fetch('http://localhost:5000/user-dashboard/create-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to create file: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === "OK") {
                console.log('File created successfully:', data.file);
                return data.file; // Return the created file object
            } else {
                console.error('Error creating file:', data.message);
                return null;
            }

        } catch (error) {
            console.error('Error creating file:', error);
        }
    }
}

function createCreateButton() {
    createButton = document.createElement('button');
    createButton.onclick = () => createFile('des', 'Untitled.des');
    createButton.textContent = "Create Untitled File"
    createContainer.appendChild(createButton);

    // Create a search for what type
}

function link_to_file(file_id) {
    window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
}

function renderFileList(files) {

    files.forEach(file => {
        const listItem = document.createElement('div');
        listItem.classList.add("file-item");

        const image = document.createElement("img");
        image.src = file.image;
        image.alt = `${file.name} thumbnail`;
        image.classList.add("file-image")
        image.style.width = '50px';
        image.style.height = '50px';

        const name = document.createElement('p');
        name.textContent = file.name;
        name.classList.add("file-name");

        const owner = document.createElement("p");
        owner.textContent = `Owner: ${file.owner}`;
        if (`${file.owner}` === 'None' ) {
            owner.textContent = `Owner: Public`
        }
        owner.classList.add("file-owner");

        const linkButton = document.createElement("button");
        linkButton.onclick = () => link_to_file(file.id);
        linkButton.textContent = "Open";


        listItem.appendChild(image);
        listItem.appendChild(name);
        listItem.appendChild(owner);
        listItem.appendChild(linkButton);
        renderContainer.appendChild(listItem);
    });
}

async function updateFileList(isCards) {
    try {
        // Fetch the latest file data
        const data = await fetchFileData(isCards);

        // Render the updated file list
        renderFileList(data.recent_files);
    } catch (error) {
        console.error('Error updating file list:', error);
    }
}

window.onload = async function () {
    try {
        createCreateButton();
        updateFileList(isCards);
    } catch (error) {
        console.error("Error initializing the file list:", error);
    }
};

const isCards = true;
const main = document.getElementById('main');
const user_nameScript = document.getElementById("user-name")
const user_name = JSON.parse(user_nameScript.textContent);

const createContainer = document.createElement('div');
    createContainer.innerHTML = "";
    main.appendChild(createContainer);

const renderContainer = document.createElement('div');
    renderContainer.innerHTML = "";
    main.appendChild(renderContainer);

const displayUserContainer = document.createElement('div');
    displayUserContainer.innerHTML = "";
    main.appendChild(displayUserContainer);

const user_name_container = document.createElement('p');
    user_name_container.textContent = `User Name: ${user_name}`;
    displayUserContainer.appendChild(user_name_container);