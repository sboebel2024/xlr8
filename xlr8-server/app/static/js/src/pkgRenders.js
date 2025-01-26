function createIco(icoClass, derivative) {
    const lnkIco = document.createElement('i');
    lnkIco.classList.add('fas', icoClass);
    derivative.appendChild(lnkIco);
}

function renderCreateButton(createContainer) {
    createButton = document.createElement('button');
    createButton.onclick = () => createFile('des', 'Untitled.des');
    styleCreateButton(createButton);
    
    renderPopup(createButton, "Create File", 48, -80, 80);

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

