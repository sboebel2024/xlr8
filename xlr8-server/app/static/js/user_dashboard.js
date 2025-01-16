const isCards = true;
const main = document.getElementById('main');

// Fetch file data
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

function link_to_file(file_id) {
    window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
}

function renderFileList(files) {
    const container = document.createElement('div');
    container.innerHTML = "";
    main.appendChild(container);

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
        owner.classList.add("file-owner");

        const linkButton = document.createElement("button");
        linkButton.onclick = () => link_to_file(file.id);
        linkButton.textContent = "Open";


        listItem.appendChild(image);
        listItem.appendChild(name);
        listItem.appendChild(owner);
        listItem.appendChild(linkButton);
        container.appendChild(listItem);
    });
}

window.onload = async function () {
    try {
        const data = await fetchFileData(isCards); 
        renderFileList(data.recent_files);
    } catch (error) {
        console.error("Error initializing the file list:", error);
    }
};





// document.getElementById('sendRequest').addEventListener('click', function() {
//     const file_id = 1;
//     window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
// });

// document.getElementById('createFile').addEventListener('click', function() {
    
//     window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
// });

