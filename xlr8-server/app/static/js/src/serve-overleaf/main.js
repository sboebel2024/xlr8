const contentScript = document.getElementById('content-data');
const content = JSON.parse(contentScript.textContent);
const fileIdScript = document.getElementById('file-id');
const fileId = JSON.parse(fileIdScript.textContent);
const userIdScript = document.getElementById('user-id');
const userId = JSON.parse(userIdScript.textContent);
const userScript = document.getElementById('user-name');
const user_name = JSON.parse(userScript.textContent);
const nameScript = document.getElementById('file-name');
const fileName = JSON.parse(nameScript.textContent);
const orgNameScript = document.getElementById('org-name');
const org_name = JSON.parse(orgNameScript.textContent);
const fileOvlfStrScript = document.getElementById('file-ovlf-str');
const fileOvlfStr = JSON.parse(fileOvlfStrScript.textContent);

const file = fileOvlfStr

const body = document.body;
body.style.margin = '0px';
body.style.height = '100%';

const api_container = document.getElementById('api_container');
styleApiContainer(api_container);
api_container.style.alignItems = 'center';
api_container.style.display = 'block';
api_container.style.overflow = 'hidden';
api_container.style.margin = '0';
api_container.style.padding = '0';

const header = document.getElementById('header');
renderHeader(header);


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
    renderPopup(saveButton, "force save", 48, -80, 80);
    createIco("fa-arrow-up", saveButton);
}

function renderDashboardButton(dashboardButton) {
    createIco("fa-arrow-left", dashboardButton);
    styleDashboardButton(dashboardButton);
    dashboardButton.onclick = () => linkToDashboard();
    renderPopup(dashboardButton, "dashboard", 48, 20, 80);
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

// Hack =} ------------------------------------------------------------

let length = api_container.offsetWidth;
let height = api_container.offsetHeight;

// Generate a unique user ID and session ID
localStorage.setItem("userId", userId);
const sessionId = `${userId}`;

console.log(`🔗 Client connecting with sessionId: ${sessionId}`);

const wsPath = "wss://xlr8.online/ws/";
// Establish WebSocket connection
const ws = new WebSocket(`${wsPath}?userId=${sessionId}&length=${length}&height=${height}&file=${file}`);

ws.onopen = () => {
    console.log(`✅ WebSocket connected with sessionId: ${sessionId}`);
};

// Create and attach the canvas
const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
const ctx = canvas.getContext('2d', { willReadFrequently: true });
document.getElementById('api_container').appendChild(canvas);

// Image streaming setup
let lastTimestamp = 0;
let lastChunkTime = performance.now();
let lastFrameProcessedTime = performance.now();
let imageChunks = [];
let frameSize = 4;
let lastBlobURL = null;
let isProcessingFrame = false; // Processing lock
let pendingChunks = []; 
let frameTimeout = null;


function drawFrame(img) {
    requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });
}

let counter = 0;

ws.onmessage = async (event) => {
    let now = performance.now();
    let timeSinceLastChunk = now - lastChunkTime;
    lastChunkTime = now;

    if (isProcessingFrame) {
        console.warn(`⚠️ Frame is still rendering! Buffering chunk.`);
        pendingChunks.push(event.data);
        return; // Don't process new chunks yet
    }

    const img = new Image();

    if (ws.bufferedAmount > 1000000) { // If buffer size grows too large
        console.warn("WebSocket buffer is full, dropping frame");
        imageChunks = []; // Reset chunks to avoid frame delay
        return;
    }
    imageChunks.push(event.data);

    console.log(`🟡 Chunk received. Count: ${imageChunks.length}, Time since last: ${timeSinceLastChunk.toFixed(3)}ms`);
    



    try {
        if (imageChunks.length >= frameSize) {
            let frameStart = performance.now();
            isProcessingFrame = true;
            console.log(`✅ Full frame received. Processing frame with ${imageChunks.length} chunks.`);
            const fullBlob = new Blob(imageChunks, { type: "image/jpeg" });
            imageChunks = [];

            
            // img.src = URL.createObjectURL(fullBlob);
            if (lastBlobURL) {
                URL.revokeObjectURL(lastBlobURL); // Revoke the old one
            }

            lastBlobURL = URL.createObjectURL(fullBlob);
            img.src = lastBlobURL;

            frameTimeout = setTimeout(() => {
                console.error("⏳ Frame processing timed out! Skipping frame.");
                isProcessingFrame = false;
                imageChunks = [];
            }, 10); // 500ms timeout

            img.onload = () => {
                clearTimeout(frameTimeout);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let frameEnd = performance.now();
                let frameProcessingTime = frameEnd - frameStart;
                let frameInterval = frameStart - lastFrameProcessedTime;
                lastFrameProcessedTime = frameStart;
                
                console.log(`✅ Frame processed in ${frameProcessingTime.toFixed(3)}ms`);
                console.log(`🔵 Frame interval: ${frameInterval.toFixed(3)}ms`);
                //console.log(`✅ Frames Processed: ${counter}`);

                isProcessingFrame = false;

                setTimeout(() => {
                    if (pendingChunks.length > 0) {
                        console.log(`🔄 Processing ${pendingChunks.length} buffered chunks.`);
                        imageChunks.push(...pendingChunks);
                        pendingChunks = [];
                    }
                }, 10);

                counter = 0;
            };
        }
    } catch (error) {
        console.log(`Frame Corrupted...${error}`)
    }
};

// ✅ **Fixed sendMessage function**
function sendMessage(type, data = {}) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: type,
            userId: sessionId,
            ...data
        }));
    } else {
        console.warn(`⚠️ WebSocket not ready. Skipping ${type} event.`);
    }
}

// Chromium resolution
const chromiumWidth = length;
const chromiumHeight = height;

// ✅ **Fixed event listeners to correctly pass event data**
document.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = chromiumWidth / rect.width;
    const scaleY = chromiumHeight / rect.height;
    
    sendMessage("mousemove", {
        x: Math.round((event.clientX - rect.left) * scaleX),
        y: Math.round((event.clientY - rect.top) * scaleY)
    });
});

document.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = chromiumWidth / rect.width;
    const scaleY = chromiumHeight / rect.height;

    sendMessage("mousedown", {
        x: Math.round((event.clientX - rect.left) * scaleX),
        y: Math.round((event.clientY - rect.top) * scaleY),
        button: event.button
    });
});

document.addEventListener("mouseup", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = chromiumWidth / rect.width;
    const scaleY = chromiumHeight / rect.height;

    sendMessage("mouseup", {
        x: Math.round((event.clientX - rect.left) * scaleX),
        y: Math.round((event.clientY - rect.top) * scaleY),
        button: event.button
    });
});

document.addEventListener("wheel", (event) => {
    sendMessage("scroll", { deltaY: event.deltaY });
});

document.addEventListener("keydown", (event) => {
    sendMessage("keydown", { key: event.key, code: event.code });
});

document.addEventListener("keyup", (event) => {
    sendMessage("keyup", { key: event.key, code: event.code });
});

// ✅ **Fixed resize event handling**
window.addEventListener("resize", () => sendResize());

function sendResize() {
    sendMessage("resize", {
        width: window.innerWidth,
        height: window.innerHeight
    });
}

// Generates a random user ID
function generateUserId() {
    return "user_" + Math.random().toString(36);
}