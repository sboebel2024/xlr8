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