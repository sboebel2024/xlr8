function styleUserNameContainer_None(userNameContainer) {
    userNameContainer.style.width = '40px';
    userNameContainer.style.height = '40px';
    userNameContainer.style.color = '#AAA';
    userNameContainer.style.display = 'flex';
    userNameContainer.style.alignItems = 'center';
    userNameContainer.style.justifyContent = 'center';
    userNameContainer.style.borderRadius = '10px';
    userNameContainer.style.cursor = 'pointer';
}

function styleUserNameContainer_NotNone(userNameContainer) {
    userNameContainer.style.height = '40px';
    userNameContainer.style.color = '#AAA';
    userNameContainer.style.display = 'flex';
    userNameContainer.style.alignItems = 'center';
    userNameContainer.style.justifyContent = 'center';
    userNameContainer.style.borderRadius = '10px';
    userNameContainer.style.cursor = 'pointer';
    //userNameContainer.style.paddingRight = '10px';
}

function styleUserNameDiv(userNameDiv) {
    userNameDiv.style.marginRight = '10px';
    userNameDiv.style.marginLeft = '10px';
    userNameDiv.style.fontFamily = 'Arial, sans-serif';
    userNameDiv.style.fontSize = '18px';
    userNameDiv.style.color = '#444';
}

function styleDropdown(container, listElems, derivative, x, y, width) {
    const derivativeRect = derivative.getBoundingClientRect();
    container.style.position = 'absolute';
    container.style.top = `${(derivativeRect.top + derivativeRect.bottom+ y)/2}px`;
    container.style.left = `${(derivativeRect.left + derivativeRect.right+ x)/2}px`;
    container.style.width = `${width}px`;
    container.style.borderRadius = '10px';
    container.style.backgroundColor = '#FFF';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.paddingTop = '10px';
    container.style.paddingBottom = '10px';
    container.style.gap = '10px';

    container.style.color = '#000';
    container.style.fontSize = '14px';
    container.style.fontFamily = 'Arial, sans-serif';
    
    const popupTriangle = document.createElement('div');
    popupTriangle.style.position = 'absolute';
    popupTriangle.style.width = '0';
    popupTriangle.style.height = '0';
    popupTriangle.style.borderLeft = '5px solid transparent';
    popupTriangle.style.borderRight = '5px solid transparent';
    popupTriangle.style.borderBottom = '5px solid #FFF';
    popupTriangle.style.top = '-5px';
    popupTriangle.style.left = '50%';
    popupTriangle.style.transform = 'translateX(-50%)';
    container.appendChild(popupTriangle);

    for (let elem of listElems) {
        container.appendChild(elem);
    }

    document.body.appendChild(container);
}

function stylePopup(popup, text, derivative, x, y, width) {
    const derivativeRect = derivative.getBoundingClientRect();
    popup.style.position = 'absolute';
    popup.style.top = `${derivativeRect.top+ x}px`;
    popup.style.left = `${(derivativeRect.left + derivativeRect.right+ y)/2}px`;
    popup.style.width = `${width}px`;
    popup.style.height = '28px';
    popup.style.borderRadius = '7px';
    popup.style.backgroundColor = '#000';
    popup.innerText = text;
    popup.style.color = '#FFF';
    popup.style.fontSize = '14px';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.fontFamily = 'Arial, sans-serif';
    popup.style.justifyContent = 'center';

    const popupTriangle = document.createElement('div');
    popupTriangle.style.position = 'absolute';
    popupTriangle.style.width = '0';
    popupTriangle.style.height = '0';
    popupTriangle.style.borderLeft = '5px solid transparent';
    popupTriangle.style.borderRight = '5px solid transparent';
    popupTriangle.style.borderBottom = '5px solid #000';
    popupTriangle.style.top = '-5px';
    popupTriangle.style.left = '50%';
    popupTriangle.style.transform = 'translateX(-50%)';
    popup.appendChild(popupTriangle);
    document.body.appendChild(popup);
}

function styleDashboardButton(dashboardButton) {
    dashboardButton.style.all = 'unset';
    dashboardButton.style.width = '40px';
    dashboardButton.style.height = '40px';
    dashboardButton.style.color = '#AAA';
    dashboardButton.style.display = 'flex';
    dashboardButton.style.alignItems = 'center';
    dashboardButton.style.justifyContent = 'center';
    dashboardButton.style.borderRadius = '10px';
    dashboardButton.style.cursor = 'pointer';
}

function styleLogo(logo) {
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
    logo.style.color = '#000';
}

function stylePathLogo(pathLogo) {
    pathLogo.style.width = '20px';
    pathLogo.style.height = '50px';
    pathLogo.innerText = '/';
    pathLogo.style.display = 'flex';
    pathLogo.style.alignItems = 'center';
    pathLogo.style.justifyContent = 'center';
    pathLogo.style.fontFamily = 'Arial, sans-serif';
    pathLogo.style.fontWeight = 'bold';
    pathLogo.style.fontSize = '20px';
    pathLogo.style.color = '#000';
}

function styleName(name) {
    name.style.textAlign = 'left';
    name.style.overflow = 'hidden';
    name.style.whiteSpace = 'nowrap';
    name.style.textoverflow = 'ellipsis';
    name.style.alignContent = 'center';
    name.style.marginTop = '15px';
}

function styleApiContainer(api_container) {
    api_container.style.width = '99.7vw';
    api_container.style.height = 'calc(99.7vh - 50px)';
    api_container.style.margin = '0px';
}

function styleHeader(header) {
    header.style.height = '50px';
    header.style.display = 'flex';
    header.style.flexDirection = 'row';
    header.style.justifyContent = 'left';
    header.style.alignItems = 'center';
    header.style.position ='relative';
    header.style.gap = '5px';
}

function styleLogo(logo) { 
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
    logo.style.cursor = 'pointer';
}

function stylePathLogo(pathLogo) {
    pathLogo.style.width = '20px';
    pathLogo.style.height = '50px';
    pathLogo.innerText = '/';
    pathLogo.style.display = 'flex';
    pathLogo.style.alignItems = 'center';
    pathLogo.style.justifyContent = 'center';
    pathLogo.style.fontFamily = 'Arial, sans-serif';
    pathLogo.style.fontWeight = 'bold';
    pathLogo.style.fontSize = '20px';
}

function styleSaveButton(saveButton) {
    saveButton.style.all = 'unset';
    saveButton.style.marginLeft = '5px';
    saveButton.style.marginRight = '5px';
    saveButton.style.display = 'inline-block';
    saveButton.style.width = '40px';
    saveButton.style.height = '40px';
    saveButton.style.display = 'flex';
    saveButton.style.color = '#AAA'
    saveButton.style.borderRadius = '10px';
    saveButton.style.justifyContent = 'center';
    saveButton.style.alignItems = 'center';
    saveButton.classList.add("logo-button");
    saveButton.style.cursor = 'pointer';
}



function styleHeader(header) {
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '5px';
}

function styleCreateButton(createButton) {
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
}

