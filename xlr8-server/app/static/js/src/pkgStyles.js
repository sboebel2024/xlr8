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