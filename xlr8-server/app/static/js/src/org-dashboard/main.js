
// Org Dashboard


const user_nameScript = document.getElementById("user-name")
const user_name = JSON.parse(user_nameScript.textContent);
const userIdScript = document.getElementById('user-id');
const userId = JSON.parse(userIdScript.textContent);
const org_nameScript = document.getElementById("org-name");
const org_name = JSON.parse(org_nameScript.textContent);
const orgIdScript = document.getElementById("org-id");
const orgId = JSON.parse(orgIdScript.textContent);

// Declare State Variables
const isCards = true;

// Redirect to the file viewer
function link_to_file(file_id) {
    console.log(file_id);
    window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
}

// Copy the link to the user's clipboard
async function copyLink(file_id) {
    const link = `https://xlr8.online/user-dashboard/access-file?file_id=${file_id}`;

    navigator.clipboard.writeText(link)
        .then(() => {
            const popup = document.getElementById('lnkPopup');
            popup.innerText = 'Link copied!';
        })
        .catch(err => {
            console.error('Failed to copy: ', err); 
        });
}


// If the window gets reloaded, update the file list
window.onload = async function () {
    try {
        updateFileList(isCards);
    } catch (error) {
        console.error("Error initializing the file list:", error);
    }
};
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        updateFileList(isCards);
        
    }
});


document.body.style.margin = '0';

const main = document.getElementById('main');

const header = document.createElement('div');
renderHeader(header, user_name, org_name);
header.style.borderBottom = '2px solid #888';
main.appendChild(header);

const dash = document.createElement('div');
renderDash(dash, user_name, org_name)
main.appendChild(dash);

const renderContainer = document.createElement('div');
renderContainer.innerHTML = "";
styleRenderContainer(renderContainer);
main.appendChild(renderContainer);