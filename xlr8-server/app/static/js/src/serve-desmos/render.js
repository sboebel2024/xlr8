
function renderNameForm(nameForm, fileName) {
    nameForm.type = 'text';
    nameForm.value = fileName;
    nameForm.style.all = 'unset';
    nameForm.style.fontFamily = 'Arial, sans-serif';
    nameForm.style.fontSize = '18px';
    nameForm.setAttribute('spellcheck', 'false');
    nameForm.id = 'NameForm';

    adjustInputWidth(nameForm);
    
    header.appendChild(nameForm);

    nameForm.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const result = changeFilename(nameForm.value);
            nameForm.value = result.file.name;
        }
        adjustInputWidth(nameForm);
    });
}

function renderNameTxt(nameTxt, fileName) {
    nameTxt.textContent = fileName;
    nameTxt.style.width = '75px'
    nameTxt.id = 'NameTxt';
    nameTxt.style.marginRight = '20px';
    nameTxt.style.fontFamily = 'Arial, sans-serif';
    nameTxt.style.fontSize = '18px';
    header.appendChild(nameTxt);
}

function renderSaveButton(saveButton, fileName, fileId) {
    styleSaveButton(saveButton);
    const isOwningUser = parseInt(document.getElementById("is-owning-user").textContent, 10);
    if (isOwningUser === 1) {
        saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameForm.value);
        const nameForm = document.createElement('input');
        renderNameForm(nameForm, fileName);

    } else {
        saveButton.onclick = () => editFileContent(fileId, JSON.stringify(calculator.getState()), nameTxt.textContent);
        const nameTxt = document.createElement('p');
        renderNameTxt(nameTxt, fileName);

    }
    renderPopup(saveButton, "force save", 48, 20, 80);
    createIco("fa-arrow-up", saveButton);
}

function renderDashboardButton(dashboardButton) {
    createIco("fa-arrow-left", dashboardButton);
    styleDashboardButton(dashboardButton);
    dashboardButton.onclick = () => linkToDashboard();
    renderPopup(dashboardButton, "dashboard", 48, -80, 80);
}

function renderHeader(header) {
    styleHeader(header);

    const logo = document.createElement('div');
    styleLogo(logo);
    logo.addEventListener('mousedown', () => {
        linkToDashboard();
    });
    header.appendChild(logo);
    

    const pathLogo = document.createElement('div');
    stylePathLogo(pathLogo);
    header.appendChild(pathLogo);

    const saveButton = document.createElement('button');
    renderSaveButton(saveButton, fileName, fileId);
    header.appendChild(saveButton);

    userNameContainer = document.createElement('button');
    userNameContainer.style.all = 'unset';
    // Check if the user is a temp user
    if (user_name === "BAD_USERNAME_#$&^%") {
        renderUserNameContainer_None(userNameContainer);

    } else {
        renderUserNameContainer_NotNone(userNameContainer, userId);

    }
    header.appendChild(userNameContainer);

    // const dashboardButton = document.createElement('button');
    // renderDashboardButton(dashboardButton);
    // header.appendChild(dashboardButton);


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
    renderCreateOrgButton(createOrgButton);
    header.appendChild(createOrgButton);
}