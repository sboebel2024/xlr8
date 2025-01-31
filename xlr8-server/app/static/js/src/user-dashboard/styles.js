

function styleListItem(listItem) {
    listItem.style.all = 'unset';
    listItem.style.cursor = 'pointer';
    listItem.style.marginLeft = '10px';
    listItem.style.marginTop = '10px';
    listItem.style.width = '200px';
    listItem.style.height = '200px';
    listItem.style.borderColor = '#444';
    listItem.style.borderRadius = '20px';
    listItem.style.boxShadow = '4px 4px 10px rgba(0,0,0,0.3)';
    listItem.style.display = 'flex';
    listItem.style.flexDirection = 'column';
    listItem.style.alignItems = 'center';
}

function styleImage(image) {
    image.style.width = '140px';
    image.style.height = '140px';
    image.style.marginTop = '15px';
}

function styleInfoContainer(infoContainer) {
    infoContainer.style.fontFamily = 'Arial, sans-serif';
    infoContainer.style.fontSize = '14px';
    infoContainer.style.fontWeight = 'bold';
    infoContainer.style.width = '150px';
    infoContainer.style.height = '65px';
    infoContainer.style.display = 'flex';
    infoContainer.style.marginTop = '7.5px';
    infoContainer.style.alignItems = 'center';
    infoContainer.style.maxWidth = '150px';
    infoContainer.style.justifyContent = 'center';
    infoContainer.style.maxHeight = '25px';
}

function styleXButton(xButton) {
    xButton.style.all = 'unset';
    xButton.style.color = '#000';
    xButton.style.marginLeft = '10px';
    xButton.style.width = '20px';
    xButton.style.height = '20px';
    xButton.style.borderRadius = '5px';
    xButton.style.display = 'flex';
    xButton.style.justifyContent = 'center';
    xButton.style.alignItems = 'center';
}

function styleLnkButton(lnkButton) {
    lnkButton.style.all = 'unset';
    lnkButton.style.marginLeft = '10px';
    lnkButton.style.width = '20px';
    lnkButton.style.height = '20px';
    lnkButton.style.borderRadius = '5px';
    lnkButton.style.display = 'flex';
    lnkButton.style.justifyContent = 'center';
    lnkButton.style.alignItems = 'center';
    lnkButton.style.marginRight = '10px';
}

function styleInfoContainer2(infoContainer2) {
    infoContainer2.style.fontFamily = 'Arial, sans-serif';
    infoContainer2.style.fontSize = '14px';
    infoContainer2.style.fontWeight = 'bold';
    infoContainer2.style.width = '150px';
    infoContainer2.style.height = '65px';
    infoContainer2.style.display = 'flex';
    infoContainer2.style.color = '#000';
    infoContainer2.style.alignItems = 'center';
    infoContainer2.style.maxWidth = '150px';
    infoContainer2.style.justifyContent = 'center';
    infoContainer2.style.maxHeight = '25px';
}

function styleRenderContainer(renderContainer) {
    renderContainer.style.display = 'flex';
    renderContainer.style.justifyContent = 'left';
    renderContainer.style.flexWrap = 'wrap';
    renderContainer.style.maxWidth = '100vh';
}


function styleTitle(title) {
    title.style.height = '50px';
    title.innerText = 'dashboard';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.justifyContent = 'center';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '20px';
    title.style.width = '100px';
}