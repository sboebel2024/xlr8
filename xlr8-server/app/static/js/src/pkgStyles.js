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
    userNameContainer.style.paddingRight = '10px';
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
    popup.style.top = `${derivativeRect.top + x}px`;
    popup.style.left = `${derivativeRect.left - y}px`;
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