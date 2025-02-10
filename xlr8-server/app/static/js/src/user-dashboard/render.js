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

function renderOwner(owner, file) {
    owner.textContent = `${file.owner}`;
    if (`${file.owner}` === 'None' ) {
        owner.textContent = ``;
    }
    owner.classList.add("file-owner");
    owner.style.marginLeft = '10px';
    owner.style.marginRight = '10px';
}

function renderOrgName(orgName, file) {
    orgName.textContent = `${file.org}`;
    if (`${file.org}` === 'null' ) {
        orgName.textContent = ``;
    }
    orgName.classList.add("file-org-name");
    orgName.style.marginLeft = '10px';
    orgName.style.marginRight = '10px';
}

function renderLnkButton(lnkButton, file) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savecontainer3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        stylePopup(savecontainer3, "Copy Share Link", lnkButton, 30, -125, 125);
        savecontainer3.id = 'lnkPopup';

    });
    lnkButton.addEventListener("mousedown", () => {
        lnkButton.style.backgroundColor = '#FFF';
    });
    lnkButton.addEventListener("mouseup", () => {
        lnkButton.style.backgroundColor = '#AAA';
    });
    lnkButton.addEventListener('mouseleave', () => {
        lnkButton.style.backgroundColor = '';
        document.body.removeChild(savecontainer3);
    });
    lnkButton.onclick = () => copyLink(file.id);

    createIco('fa-share', lnkButton);
}


function renderUserInfo(lnkButton) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savecontainer3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        stylePopup(savecontainer3, "User Info", lnkButton, 30, -80, 80);
        savecontainer3.id = 'lnkcontainer';

    });
    lnkButton.addEventListener("mousedown", () => {
        lnkButton.style.backgroundColor = '#FFF';
    });
    lnkButton.addEventListener("mouseup", () => {
        lnkButton.style.backgroundColor = '#AAA';
    });
    lnkButton.addEventListener('mouseleave', () => {
        lnkButton.style.backgroundColor = '';
        
        document.body.removeChild(savecontainer3);
    });
    //lnkButton.onclick = () => copyLink(file.id); <-- change to User Profile

    createIco('fa-caret-right', lnkButton);
}

function renderOrgInfo(lnkButton) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savecontainer3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        stylePopup(savecontainer3, "Org Info", lnkButton, 30, -80, 80);
        savecontainer3.id = 'lnkcontainer';

    });
    lnkButton.addEventListener("mousedown", () => {
        lnkButton.style.backgroundColor = '#FFF';
    });
    lnkButton.addEventListener("mouseup", () => {
        lnkButton.style.backgroundColor = '#AAA';
    });
    lnkButton.addEventListener('mouseleave', () => {
        lnkButton.style.backgroundColor = '';
        //listItem.onclick = () => link_to_file(file.id);
        document.body.removeChild(savecontainer3);
    });
    lnkButton.onclick = () => window.location.href = '/org-dashboard/';

    createIco('fa-caret-right', lnkButton);
}

function renderDelButton(lnkButton, file) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savecontainer3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        stylePopup(savecontainer3, "Delete File", lnkButton, 30, -80, 80);
        savecontainer3.id = 'delPopup';

    });
    lnkButton.addEventListener("mousedown", () => {
        lnkButton.style.backgroundColor = '#FFF';
    });
    lnkButton.addEventListener("mouseup", () => {
        lnkButton.style.backgroundColor = '#AAA';
    });
    lnkButton.addEventListener('mouseleave', () => {
        lnkButton.style.backgroundColor = '';
        //listItem.onclick = () => link_to_file(file.id);
        document.body.removeChild(savecontainer3);
    });
    lnkButton.onclick = () => {
        delete_file(file.id);
        const grandfather = lnkButton.parentElement.parentElement;
        grandfather.remove();
        savecontainer3.remove();
    }

    createIco('fa-times', lnkButton);
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

function renderLnk(lnk, text) {
    lnk.innerText = text;
    lnk.style.marginLeft = '10px';
    lnk.style.marginRight = '10px';
}

function renderList(file) {
    const owner = document.createElement('div');
    renderOwner(owner, file);
    const orgName = document.createElement('div');
    renderOrgName(orgName, file);
    const lnk = document.createElement('div');
    renderLnk(lnk, "Copy Link");
    const del= document.createElement('div');
    renderLnk(del, "Delete File")
    const orgNameContainer = document.createElement('div');
    const ownerContainer = document.createElement('div');
    const lnkContainer = document.createElement('div');
    const deleteContainer = document.createElement('div');
    ownerContainer.style.display = 'flex';
    ownerContainer.style.flexDirection = 'row';
    orgNameContainer.style.display = 'flex';
    orgNameContainer.style.flexDirection = 'row';
    lnkContainer.style.display = 'flex';
    lnkContainer.style.flexDirection = 'row';
    deleteContainer.style.display = 'flex';
    deleteContainer.style.flexDirection = 'row';
    const userInfoButton = document.createElement('div');
    const orgInfoButton = document.createElement('div');
    const lnkButton = document.createElement('div');
    const delButton = document.createElement('div');
    renderOrgInfo(orgInfoButton);
    renderUserInfo(userInfoButton);
    renderLnkButton(lnkButton, file);
    renderDelButton(delButton, file);

    var list = [];

    
    if (!(`${file.owner}` === 'None' )) {
        ownerContainer.appendChild(owner);
        ownerContainer.appendChild(userInfoButton); 
        
        list.push(ownerContainer);

    }
    if (!(`${file.org}` === 'null' )) {
        orgNameContainer.appendChild(orgName);
        orgNameContainer.appendChild(orgInfoButton);
        list.push(orgNameContainer);
    }
    lnkContainer.appendChild(lnk);
    lnkContainer.appendChild(lnkButton);
    list.push(lnkContainer);
    deleteContainer.appendChild(del);
    deleteContainer.appendChild(delButton);
    list.push(deleteContainer);
    
    console.log(list);

    
    return list;
}

function renderXButton(xButton, file) {
    styleXButton(xButton);
    const list = renderList(file);
    renderDropdown(list, xButton, -150, 40, 150, true);
    // renderPopup(xButton, "Delete File", 30, 30, 80);
    xButton.addEventListener('onclick', () => {
        setTimeout(function() {
            xButton.style.color = '#000';
        }, 2000);
    });
    xButton.addEventListener('mouseleave', () => {
        xButton.style.color = '#000';
    });
    createIco('fa-caret-right', xButton);
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
    const isDes = (file.ext === ".des") || (file.ext === "des");
    styleListItem(listItem);

    listItem.classList.add("file-item");

    listItem.onclick = async () => await link_to_file(file.id, isDes);

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

    const xButton = infoContainer.children[1];
    xButton.addEventListener('mouseenter', () => {
        listItem.onclick = "";
    });
    xButton.addEventListener('mouseleave', () => {
        listItem.onclick = async () => await link_to_file(file.id, isDes);
    });
    listItem.appendChild(image);
    listItem.appendChild(infoContainer);
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

function renderHeader(header, user_name, org_name) {
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

    userNameContainer = document.createElement('button');
    userNameContainer.style.all = 'unset';
    console.log(user_name)
    if (user_name === "None") {
        // Render the log in button
        renderUserNameContainer_None(userNameContainer);
    } else {   
        // Render the log out button
        renderUserNameContainer_NotNone(userNameContainer, userId);
    }
    header.appendChild(userNameContainer);

    orgNameContainer = document.createElement('button');
    orgNameContainer.style.all = 'unset';
    if (org_name === "None") {
        // Render the org join etc. stuff
        const joinOrgButton = document.createElement('button');
        renderJoinOrgButton(joinOrgButton, user_name);
        header.appendChild(joinOrgButton);

    } else {   
        // Render the log out button
        renderOrgNameContainer(orgNameContainer);
        header.appendChild(orgNameContainer);
    }
    



    const createOrgButton = document.createElement('button');
    renderCreateOrgButton(createOrgButton, user_name);
    header.appendChild(createOrgButton);

}
