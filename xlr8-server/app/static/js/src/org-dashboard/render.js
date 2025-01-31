async function renderHeader(header, user_name, org_name) {
    styleHeader(header);

    const logo = document.createElement('div');
    logo.style.all = 'div';
    logo.style.cursor = 'pointer';
    logo.onclick = () => {
        linkToDashboard();
    }
    styleLogo(logo);
    header.appendChild(logo);

    const pathLogo = document.createElement('div');
    stylePathLogo(pathLogo);
    header.appendChild(pathLogo);

    const title = document.createElement('div');
    styleTitle2(title);
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
    if (isAdmin) {

        const treeContainer = document.createElement('button');
        treeContainer.style.all = 'unset';
        renderTreeContainer(treeContainer);
        header.appendChild(treeContainer);

        const code = await retrieveCode();
        const codeContainer = document.createElement('button');
        codeContainer.style.all = 'unset';
        if (code === "None") {
            renderCodeContainer(codeContainer, code);
        } else {
            renderCodeContainer(codeContainer, code);
        }
        codeContainer.style.paddingRight = '10px';
        header.appendChild(codeContainer);
    }
}

function renderTreeContainer(treeContainer) {
    treeButton = document.createElement('button');
    treeButton.onclick = () => {
        window.location.href = '/org-dashboard/org-tree';
    };
    styleCreateButton(treeButton);
    renderPopup(treeButton, "View Org Tree", 48, -125, 125);
    createIco("fa-tree", treeButton);
    treeContainer.appendChild(treeButton);
}



function renderCodeViewer(code) {
    codeViewer.style.all = 'unset';
    styleCodeViewer(codeViewer);
    codeViewer.style.flexDirection = 'row';
    const codeP = document.createElement('div');
    codeP.innerText = `Join Code: ${code}`;
    codeP.style.marginRight = '10px';
    codeViewer.appendChild(codeP);    
    createIco('fa-copy', codeViewer);
    codeViewer.onclick = () => {
        copyCode(code)
        popup.innerText = 'Copied!';
    };
    codeViewer.addEventListener('mouseenter', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
        popup = document.createElement('div');
        stylePopup(popup, "Copy Join Code", codeViewer, 140, -125, 125);
    });
    codeViewer.addEventListener('mousedown', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
    });
    codeViewer.addEventListener('mouseup', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
    });
    codeViewer.addEventListener('mouseleave', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
        popup.remove()
    })
}

function renderOrgUserData(codeViewer, userNumber, adminNumber) {
    styleCodeViewer(codeViewer);
    const codeP1 = document.createElement('div');
    codeP1.innerText = `Users: ${userNumber}`;
    const codeP2 = document.createElement('div');
    codeP2.innerText = `Admins: ${adminNumber}`;
    codeViewer.appendChild(codeP1); 
    codeViewer.appendChild(codeP2);   
    codeViewer.addEventListener('mouseenter', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
        popup = document.createElement('div');
        stylePopup(popup, "Org Member Data", codeViewer, 140, -125, 125);
    });
    codeViewer.addEventListener('mousedown', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
    });
    codeViewer.addEventListener('mouseup', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
    });
    codeViewer.addEventListener('mouseleave', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
        popup.remove()
    })
}

function renderAddDataViewer(codeViewer) {
    styleCodeViewer(codeViewer);
    const codeP1 = document.createElement('i');
    codeP1.classList.add('fas', 'fa-plus');
    codeP1.style.color = '#888';
    codeViewer.appendChild(codeP1); 
    codeViewer.onclick = () => {
        popup.innerText = 'Coming soon!';
    };
    codeViewer.addEventListener('mouseenter', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
        popup = document.createElement('div');
        stylePopup(popup, "Add Data View", codeViewer, 140, -125, 125);
    });
    codeViewer.addEventListener('mousedown', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
    });
    codeViewer.addEventListener('mouseup', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.6)';
    });
    codeViewer.addEventListener('mouseleave', () => {
        codeViewer.style.boxShadow =  '4px 4px 10px rgba(0,0,0,0.3)';
        popup.remove()
    })
}

async function renderDash(dash, user_name, org_name) {
    styleDash(dash);
    const code = await retrieveCode();
    const data = await getMembersData();
    const userNumber = data.userNumber;
    const adminNumber = data.adminNumber;
    codeViewer = document.createElement('button');
    codeViewer.style.all = 'unset';
    dash.style.borderBottom = "2px solid #888";
    renderCodeViewer(code);
    memberViewer = document.createElement('div');
    renderOrgUserData(memberViewer,userNumber, adminNumber);
    addDataViewer = document.createElement('div');
    renderAddDataViewer(addDataViewer);


    dash.appendChild(codeViewer);
    dash.appendChild(memberViewer);
    dash.appendChild(addDataViewer);

}