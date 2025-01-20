const isCards = true;

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
            //throw new Error(`Error: ${response.status} - ${response.statusText}`);
            return { error: `Error: ${response.status}` };
        }

        const fileData = await response.json();
        console.log('File Data', fileData);
        return fileData
    } catch (error) {
        //console.error('Error fetching file data:', error);
        return { error: 'An unexpected error occurred.' };
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

            const response = await fetch('/user-dashboard/create-file', {
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

            updateFileList(isCards);

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

document.body.style.margin = '0';

function createCreateButton() {
    createButton = document.createElement('button');
    createButton.onclick = () => createFile('des', 'Untitled.des');
    createButton.style.all = 'unset';
    createButton.style.display = 'flex';
    createButton.style.alignItems = 'center';
    createButton.style.justifyContent = 'center';
    createButton.style.width = '40px';
    createButton.style.height = '40px';
    createButton.style.color = '#888';
    createButton.style.fontSize = '14px';
    createButton.style.cursor = 'pointer';
    createButton.style.borderRadius = '10px';
    createButton.style.fontWeight = 'lighter';
    const savePopup = document.createElement('div');

    createButton.addEventListener('mouseenter', () => {
        const saveButtonRect = createButton.getBoundingClientRect(); 
        createButton.style.backgroundColor = "#AAA";
        createButton.style.color = "#444"
        savePopup.style.position = 'absolute';
        savePopup.style.top = `${saveButtonRect.top + 48}px`;
        console.log(`${saveButtonRect.right}`)
        savePopup.style.left = `${saveButtonRect.left - 20}px`;
        savePopup.style.width = '80px';
        savePopup.style.height = '28px';
        savePopup.style.borderRadius = '7px';
        savePopup.style.backgroundColor = '#000';
        savePopup.innerText = 'create file';
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
    });

    createButton.addEventListener("mousedown", () => {
        createButton.style.backgroundColor = '#FFF';
    });
    createButton.addEventListener("mouseup", () => {
        createButton.style.backgroundColor = '#AAA';
    });

    createButton.addEventListener("mouseleave", () => {
        createButton.style.backgroundColor = "";
        createButton.style.color = "#AAA";
        setTimeout(() =>{document.body.removeChild(savePopup)}, 0);
    });
    

    createIcon = document.createElement('i');
    createIcon.classList.add('fas', 'fa-plus');
    createButton.appendChild(createIcon);

    createContainer.appendChild(createButton);

    // Create a search for what type
}

function link_to_file(file_id) {
    console.log(file_id);
    window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
}

function renderFileList(files) {
    if (files === null) {
        renderContainer.innerHTML = '';
    } else { 

        renderContainer.innerHTML = '';

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

            const deleteButton = document.createElement('button');
            deleteButton.onclick = () => delete_file(file.id);
            deleteButton.textContent = "Delete"

            listItem.appendChild(image);
            listItem.appendChild(name);
            listItem.appendChild(owner);
            listItem.appendChild(linkButton);
            listItem.appendChild(deleteButton);
            renderContainer.appendChild(listItem);
        });
    }
}

async function delete_file(file_id) {
    try {
        const requestData = {
            file_id: file_id
        };
        const response = await fetch('/user-dashboard/delete-file', {
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
        updateFileList(isCards);
        console.log(fileData);
        return fileData;

    

    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

async function updateFileList(isCards) {
    try {
        // Fetch the latest file data
        const data = await fetchFileData(isCards);

        // Render the updated file list
        try {
            renderFileList(data.recent_files);
        } catch {
            renderFileList(null);
        }
    } catch (error) {
        console.error('Error updating file list:', error);
    }
}

function logUserIn() {
    // First save everything

    window.location.href = `/login/render-login`;

}

async function logUserOut() {

    const userId = parseInt(document.getElementById("user-id").textContent, 10);

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

window.onload = async function () {
    try {
        createCreateButton();
        updateFileList(isCards);
    } catch (error) {
        console.error("Error initializing the file list:", error);
    }
};

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        updateFileList(isCards);
        
    }
});

const main = document.getElementById('main');
const user_nameScript = document.getElementById("user-name")
const user_name = JSON.parse(user_nameScript.textContent);
const header = document.createElement('div');
header.width = '99.7vh';
header.height = '100px';
header.style.display = 'flex';
header.style.alignItems = 'center';
header.style.gap = '5px';
main.appendChild(header);

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

const createContainer = document.createElement('div');
    createContainer.innerHTML = "";
    header.appendChild(createContainer);

const renderContainer = document.createElement('div');
    renderContainer.innerHTML = "";
    main.appendChild(renderContainer);



userNameContainer = document.createElement('button');
userNameContainer.style.all = 'unset';
if (user_name === "None") {
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
    rightArrow.classList.add('fas', 'fa-arrow-left');
    userNameContainer.appendChild(rightArrow);
    rightArrow.style.marginLeft = '10px';
    userNameDiv = document.createElement('div');
    userNameDiv.innerText = `${user_name}`;
    userNameDiv.style.marginRight = '10px';
    userNameDiv.style.marginLeft = '10px';
    userNameDiv.style.fontFamily = 'Arial, sans-serif';
    userNameDiv.style.fontSize = '18px';
    userNameDiv.style.color = '#444';
    
    userNameContainer.appendChild(userNameDiv);
    //userNameContainer.style.width = '40px';
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
        
        savePopup2.style.left = `${userButtonRect.left + 2}px`;
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