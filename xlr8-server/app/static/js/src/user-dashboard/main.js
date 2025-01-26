/*

USER_DASHBOARD JAVASCRIPT SERVING FILE

This is one of the big bad files with a lot of stuff
that needs to get changed over to React. I will do my
best to comment all of this!
    ~Spencer

*/

// This is basically to change between cards and list.
// It's probably a good idea to stick with cards so that
// we don't have to write a new method to serve a list
// renderer.

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

// Read in data from Jinja
const user_nameScript = document.getElementById("user-name")
const user_name = JSON.parse(user_nameScript.textContent);
const userIdScript = document.getElementById('user-id');
const userId = JSON.parse(userIdScript.textContent);
const org_nameScript = document.getElementById("org-name");
const org_name = JSON.parse(org_nameScript.textContent);

console.log(user_name);
console.log(org_name);

// Get rid of the margins
document.body.style.margin = '0';

// Get the root div
const main = document.getElementById('main');

// Create the header
const header = document.createElement('div');
renderHeader(header, user_name, org_name);
main.appendChild(header);

// Create the render container
const renderContainer = document.createElement('div');
renderContainer.innerHTML = "";
styleRenderContainer(renderContainer);
main.appendChild(renderContainer);

// Create the container for the log in or log out button
