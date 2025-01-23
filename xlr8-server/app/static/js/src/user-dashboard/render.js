// These are the render functions. They are organized as follows:
// The element must exist in the parent program (i.e. main or requests)
// function renderElement(element, other args) {
//    styleElement(element);
//    element.addEventListener(event () =>{
//         doEventThings(element, other args);
//    });
//    doThingsWith(element, other args);
// }
//
// Create one of these when you need to add an event listener!


function renderCreateButton(createContainer) {
    createButton = document.createElement('button');
    createButton.onclick = () => createFile('des', 'Untitled.des');
    styleCreateButton(createButton);
    
    renderPopup(createButton, "create file", 48, 20, 80);

    createIco("fa-plus", createButton);

    createContainer.appendChild(createButton);

    // Create a search for what type (later)
}

function renderOwner(owner, file) {
    owner.textContent = `Owner: ${file.owner}`;
    if (`${file.owner}` === 'None' ) {
        owner.textContent = `Owner: Temp`
    }
    owner.classList.add("file-owner");
}

function renderLnkButton(lnkButton, listItem, file) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savePopup3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        listItem.onclick = "";
        stylePopup(savePopup3, "copy share link", lnkButton, 30, 45, 110);
        savePopup3.id = 'lnkPopup';

    });
    lnkButton.addEventListener("mousedown", () => {
        lnkButton.style.backgroundColor = '#FFF';
    });
    lnkButton.addEventListener("mouseup", () => {
        lnkButton.style.backgroundColor = '#AAA';
    });
    lnkButton.addEventListener('mouseleave', () => {
        lnkButton.style.backgroundColor = '';
        listItem.onclick = () => link_to_file(file.id);
        document.body.removeChild(savePopup3);
    });
    lnkButton.onclick = () => copyLink(file.id);

    createIco('fa-share', lnkButton);
}

function renderInfoContainer2(infoContainer2, listItem, file) {
    styleInfoContainer2(infoContainer2);

    const lnkButton = document.createElement('button');
    renderLnkButton(lnkButton, listItem, file);

    const owner = document.createElement("p");
    renderOwner(owner, file);

    infoContainer2.appendChild(owner);
    infoContainer2.appendChild(lnkButton);
}

function renderXButton(xButton, listItem, file) {
    styleXButton(xButton);
    xButton.onclick = () => delete_file(file.id);
    renderPopup(xButton, "Delete File", 30, 30, 80);
    xButton.addEventListener('mouseleave', () => {
        xButton.style.color = '#000';
    });
    createIco('fa-times', xButton);
    
}

function renderInfoContainer(infoContainer, listItem, file) {
    styleInfoContainer(infoContainer);

    const xButton = document.createElement('button');
    renderXButton(xButton, listItem, file);

    const name = document.createElement('p');
    name.textContent = file.name;
    name.classList.add("file-name");
    styleName(name);
    
    infoContainer.appendChild(name);
    infoContainer.appendChild(xButton);
}

function renderImage(image, file) {
    if (file.image) {
        image.src = `data:image/png;base64,${file.image}`;
    } else {
        image.src = "path/to/default-placeholder.png";  // Provide a fallback image
    }
    image.alt = `${file.name} thumbnail`;
    image.classList.add("file-image");
    styleImage(image);
}

function renderListItem(listItem, file) {
    styleListItem(listItem);

    listItem.classList.add("file-item");

    listItem.onclick = () => link_to_file(file.id);

    listItem.addEventListener('mouseenter', () => {
        listItem.style.boxShadow = '4px 4px 10px rgba(0,0,0,0.6)';
    });
    listItem.addEventListener('mouseleave', () => {
        listItem.style.boxShadow = '4px 4px 10px rgba(0,0,0,0.3)';
    });
    
    const image = document.createElement("img");
    renderImage(image, file);
    
    const infoContainer = document.createElement('div');
    renderInfoContainer(infoContainer, listItem, file);

    const infoContainer2 = document.createElement('div');
    renderInfoContainer2(infoContainer2, listItem, file);

    const xButton = infoContainer.children[1];
    xButton.addEventListener('mouseenter', () => {
        listItem.onclick = "";
    });
    xButton.addEventListener('mouseleave', () => {
        listItem.onclick = () => link_to_file(file.id);
    });
    
    listItem.appendChild(image);
    listItem.appendChild(infoContainer);
    listItem.appendChild(infoContainer2);
}

function renderFileList(files) {
    if (files === null) {
        renderContainer.innerHTML = '';
    } else { 

        renderContainer.innerHTML = '';

        files.forEach(file => {
        
            const listItem = document.createElement('button');

            renderListItem(listItem, file);

            renderContainer.appendChild(listItem);
        });
    }
}

function renderHeader(header) {
    styleHeader(header);

    const logo = document.createElement('div');
    styleLogo(logo);
    header.appendChild(logo);

    const pathLogo = document.createElement('div');
    stylePathLogo(pathLogo);
    header.appendChild(pathLogo);

    const title = document.createElement('div');
    styleTitle(title);
    header.appendChild(title);

    const createContainer = document.createElement('div');
    createContainer.innerHTML = "";
    header.appendChild(createContainer);

    renderCreateButton(createContainer);

}
