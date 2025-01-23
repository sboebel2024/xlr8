function createIco(icoClass, derivative) {
    const lnkIco = document.createElement('i');
    lnkIco.classList.add('fas', icoClass);
    derivative.appendChild(lnkIco);
}

function renderPopup(saveButton, text, x, y, width) {
    const savePopup = document.createElement('div');
    saveButton.addEventListener("mouseenter", () => {
        saveButton.style.backgroundColor = "#AAA";
        saveButton.style.color = "#444"
        stylePopup(savePopup, text, saveButton, x, y, width);
    });
    saveButton.addEventListener("mousedown", () => {
        saveButton.style.backgroundColor = '#FFF';
    });
    saveButton.addEventListener("mouseup", () => {
        saveButton.style.backgroundColor = '#AAA';
    });
    saveButton.addEventListener("mouseleave", () => {
        saveButton.style.backgroundColor = "";
        saveButton.style.color = "#AAA";
        document.body.removeChild(savePopup);
    });
    setTimeout(function() {
        document.body.removeChild(savePopup);
    }, 2000);
     
}

function renderUserNameDiv(userNameContainer) {
    userNameDiv = document.createElement('div');
    userNameDiv.innerText = `${user_name}`;
    styleUserNameDiv(userNameDiv);
    userNameContainer.appendChild(userNameDiv);
}

function renderUserNameContainer_None(userNameContainer) {
    styleUserNameContainer_None(userNameContainer);
    userNameContainer.onclick = () => logUserIn();
    renderPopup(userNameContainer, "Log In", 48, 10, 60);
    createIco('fa-arrow-right', userNameContainer);
}

function renderUserNameContainer_NotNone(userNameContainer, userId) {
    styleUserNameContainer_NotNone(userNameContainer);
    renderPopup(userNameContainer, "Log Out", 48, -20, 60)
    userNameContainer.onclick = () => logUserOut(userId);
    renderUserNameDiv(userNameContainer);
    createIco("fa-arrow-left", userNameContainer)
}