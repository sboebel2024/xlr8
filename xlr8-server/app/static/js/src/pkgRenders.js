function createIco(icoClass, derivative) {
    const lnkIco = document.createElement('i');
    lnkIco.classList.add('fas', icoClass);
    derivative.appendChild(lnkIco);
}

async function renderInputList() {
    const extensions = await getExtensions();

    inputContainer = document.createElement('div');

    inputContainer.style.display = 'flex';
    inputContainer.style.flexDirection = 'row';

    var list = [];

    for (let ext of extensions) {
        const inputContainer = document.createElement('div');
        const inputText = document.createElement('div');
        renderLnk(inputText, ext);
        inputContainer.style.display = 'flex';
        inputContainer.style.flexDirection = 'row';
        
        const extButton = document.createElement('div');
        createIco('fa-caret-right', extButton);
        const popup = renderPopup(extButton, "Open Extension", 30, -100, 100);

        extButton.addEventListener('mouseleave', () => {
            extButton.style.color = '#000';
            setTimeout(() => {
                popup.remove();
            }, 2000)
        });
        
        styleLnkButton(extButton);
        extButton.onclick = () => createFile(ext, `Untitled.${ext}`);

        inputContainer.appendChild(inputText);
        inputContainer.appendChild(extButton);
        
        list.push(inputContainer);

    }
    return list;
}

async function renderCreateButton(createContainer) {
    createButton = document.createElement('button');
    //createButton.onclick = () => createFile('des', 'Untitled.des');
    styleCreateButton(createButton);
    
    renderPopup(createButton, "Create File", 48, -80, 80);

    const list = await renderInputList();

    renderDropdown(list, createButton, -150, 60 , 150, false);
    createButton.addEventListener('onclick', () => {
        setTimeout(function() {
            xButton.style.color = '#000';
        }, 2000);
    });
    createButton.addEventListener('mouseleave', () => {
        xButton.style.color = '#000';
    });

    createIco("fa-plus", createButton);

    createContainer.appendChild(createButton);

    // Create a search for what type (later)
}


function renderPopup(derivative, text, x, y, width) {
    const savePopup = document.createElement('div');
    derivative.addEventListener("mouseenter", () => {
        derivative.style.backgroundColor = "#AAA";
        derivative.style.color = "#444"
        stylePopup(savePopup, text, derivative, x, y, width);
    });
    derivative.addEventListener("mousedown", () => {
        derivative.style.backgroundColor = '#FFF';
    });
    derivative.addEventListener("mouseup", () => {
        derivative.style.backgroundColor = '#AAA';
    });
    derivative.addEventListener("mouseleave", () => {
        derivative.style.backgroundColor = "";
        derivative.style.color = "#AAA";
        document.body.removeChild(savePopup);
    });
    setTimeout(function() {
        savePopup.remove();
    }, 2000);

    return savePopup;
}

function renderDropdown(listElems, derivative, x, y, width, isPopup) {
    const container = document.createElement('div');
    if (isPopup) {
        renderPopup(derivative, "File Info", 30, -80, 80);
    }
    derivative.addEventListener("mouseenter", () => {
        const ico = derivative.children[0];
        ico.style.transition = "transform 200ms ease-in-out";
        ico.style.transform =  `rotate(90deg)`;
        ico.style.transformOrigin = 'center';
        derivative.style.backgroundColor = '#AAA';
    });
    derivative.addEventListener("mousedown", () => {
        derivative.style.backgroundColor = '#FFF';
    });
    derivative.addEventListener("mouseleave", () => {
        derivative.style.backgroundColor = '#FFF';
        const ico = derivative.children[0];
        ico.style.transition = "transform 500ms ease-in-out";
        ico.style.transform = `rotate(0deg)`;
        ico.style.transformOrigin = 'center';
        derivative.style.color = '#000';
    });
    derivative.addEventListener("mouseup", () => {
        derivative.style.backgroundColor = '#AAA';   
    });

    derivative.addEventListener("click", () => {
        styleDropdown(container, listElems, derivative, x, y, width);
        container.style.boxShadow = '4px 4px 10px rgba(0,0,0,0.6)';

        document.addEventListener("dblclick", () => {
            console.log('tripped again');
            container.remove();
        });
            
    });
   
    
}

function renderUserNameDiv(userNameContainer) {
    userNameDiv = document.createElement('div');
    userNameDiv.innerText = `${user_name}`;
    styleUserNameDiv(userNameDiv);
    userNameContainer.appendChild(userNameDiv);
}

function renderCodeDiv(userNameContainer, code) {
    userNameDiv = document.createElement('div');
    userNameDiv.innerText = `${code}`;
    styleUserNameDiv(userNameDiv);
    userNameContainer.appendChild(userNameDiv);
}

function renderOrgNameDiv(orgNameContainer) {
    userNameDiv = document.createElement('div');
    userNameDiv.innerText = `${org_name}`;
    styleUserNameDiv(userNameDiv);
    orgNameContainer.appendChild(userNameDiv);
}

function renderUserNameContainer_None(userNameContainer) {
    styleUserNameContainer_None(userNameContainer);
    userNameContainer.onclick = () => logUserIn();
    renderPopup(userNameContainer, "Log In", 48, -60, 60);
    createIco('fa-arrow-right', userNameContainer);
}

function renderUserNameContainer_NotNone(userNameContainer, userId) {
    styleUserNameContainer_NotNone(userNameContainer);
    renderPopup(userNameContainer, "Log Out", 48, -60, 60)
    userNameContainer.onclick = () => logUserOut(userId);
    renderUserNameDiv(userNameContainer);
    //createIco("fa-arrow-left", userNameContainer)
}

function renderCodeContainer(userNameContainer, code) {
    styleUserNameContainer_NotNone(userNameContainer);
    const popup = renderPopup(userNameContainer, "Copy Code", 48, -100, 100)
    userNameContainer.onclick = () => {
        copyCode(code);
        popup.innerText = 'Copied!';
    };
    renderCodeDiv(userNameContainer, code);
    createIco("fa-copy", userNameContainer);
}

function renderOrgNameContainer(orgNameContainer) {
    styleUserNameContainer_NotNone(orgNameContainer);
    renderPopup(orgNameContainer, "About Org", 48, -80, 80)
    orgNameContainer.onclick = () => {
        window.location.href = '/org-dashboard/';
    }
    renderOrgNameDiv(orgNameContainer);
    //createIco("fa-arrow-left", userNameContainer)
}

function renderOrgNameContainer2(orgNameContainer) {
    styleUserNameContainer_NotNone(orgNameContainer);
    orgNameContainer.style.cursor = 'default';
    renderOrgNameDiv(orgNameContainer)
}

function renderJoinOrgButton(joinOrgButton, user_name) {
    joinOrgButton.style.all = 'unset';
    if (user_name !== 'None') {
        createIco("fa-plus", joinOrgButton);
        styleDashboardButton(joinOrgButton);
        joinOrgButton.onclick = () => {
            window.location.href = '/signup/render-join-org';
        }
        renderPopup(joinOrgButton, "Join Org", 48, -80, 80);
    }
}

function renderCreateOrgButton(createOrgButton, user_name) {
    createOrgButton.style.all = 'unset';
    if (user_name !== 'None') {
        createIco("fa-plus", createOrgButton);
        styleDashboardButton(createOrgButton);
        createOrgButton.onclick = () => {
            window.location.href = '/signup/render-create-org';
        }
        renderPopup(createOrgButton, "Create Org", 48, -80, 80);
    }
}

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

function renderPublicButton(lnkButton, file, elem) {
    styleLnkButton(lnkButton);
    // This is a custom implementation of renderPopup
    const savecontainer3 = document.createElement('div');
    lnkButton.addEventListener('mouseenter', () => {
        lnkButton.style.backgroundColor = '#AAA';
        stylePopup(savecontainer3, "Make File Public", lnkButton, 30, -120, 120);
        savecontainer3.id = 'mfpPopup';

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
        const value = togglePublicity(file);
        if (elem.innerText === 'Private') {
            console.log('True');
            elem.innerText = 'Public';
    
        } else if (elem.innerText === 'Public') {
            console.log('False');
            elem.innerText = 'Private';
        } else {
            console.log('Something is wrong!');
        }
        
        // const grandfather = lnkButton.parentElement.parentElement;
        // grandfather.remove();
        savecontainer3.remove();
    }

    createIco('fa-caret-right', lnkButton);
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
    const isPublicInOrgs = document.createElement('div');
    if (file.isPublic) {
        renderLnk(isPublicInOrgs, "Public");
    } else {
        renderLnk(isPublicInOrgs, "Private");
    }
    console.log(`Public File: ${file.isPublic}`);
    


    const orgNameContainer = document.createElement('div');
    const ownerContainer = document.createElement('div');
    const lnkContainer = document.createElement('div');
    const deleteContainer = document.createElement('div');
    const publicInOrgsContainer = document.createElement('div');
    ownerContainer.style.display = 'flex';
    ownerContainer.style.flexDirection = 'row';
    orgNameContainer.style.display = 'flex';
    orgNameContainer.style.flexDirection = 'row';
    lnkContainer.style.display = 'flex';
    lnkContainer.style.flexDirection = 'row';
    deleteContainer.style.display = 'flex';
    deleteContainer.style.flexDirection = 'row';
    publicInOrgsContainer.style.display = 'flex';
    publicInOrgsContainer.style.flexDirection = 'row';
    const userInfoButton = document.createElement('div');
    const orgInfoButton = document.createElement('div');
    const lnkButton = document.createElement('div');
    const delButton = document.createElement('div');
    const publicInOrgsButton = document.createElement('div');
    renderOrgInfo(orgInfoButton);
    renderUserInfo(userInfoButton);
    renderLnkButton(lnkButton, file);
    renderDelButton(delButton, file);
    renderPublicButton(publicInOrgsButton, file, isPublicInOrgs);


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
    publicInOrgsContainer.appendChild(isPublicInOrgs);
    publicInOrgsContainer.appendChild(publicInOrgsButton);
    console.log(`Admin Perms: ${file.canAdministrate}`);
    console.log(((userId === file.ownerId) || (file.canAdministrate)));
    if ((userId === file.ownerId) || (file.canAdministrate)) {
        list.push(deleteContainer);
        list.push(publicInOrgsContainer);
    }
    
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

function renderInfoContainer(infoContainer, listItem, file) {
    styleInfoContainer(infoContainer);

    const xButton = document.createElement('button');
    renderXButton(xButton, file);

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

function renderInfoContainer(infoContainer, listItem, file) {
    styleInfoContainer(infoContainer);
    infoContainer.style.alignContent = 'center';

    const xButton = document.createElement('button');
    renderXButton(xButton, file);

    const name = document.createElement('p');
    name.textContent = file.name;
    name.classList.add("file-name");
    styleName(name);
    
    infoContainer.appendChild(name);
    infoContainer.appendChild(xButton);
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

    const xButton = infoContainer.children[1];
    xButton.addEventListener('mouseenter', () => {
        listItem.onclick = "";
    });
    xButton.addEventListener('mouseleave', () => {
        listItem.onclick = () => link_to_file(file.id);
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