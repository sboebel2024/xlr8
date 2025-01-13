function loadIframe() {
    // Locate the iframe container
    const container = document.getElementById('iframeContainer');
    if (!container) {
        console.error('iframeContainer not found in the DOM.');
        return;
    }

    // Clear previous iframe content if any
    container.innerHTML = '';

    // Create the iframe dynamically
    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:8000'; // URL of your Python proxy server
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #ccc';
    iframe.style.marginTop = '20px';

    // Append the iframe to the container
    container.appendChild(iframe);

    // Locate the button and remove it
    var button = document.getElementById('myButton');
    if (button) {
        button.remove();
    } else {
        console.error('Button with id "butt" not found in the DOM.');
    }
}

console.log('The javascript file has been initialized.')
var main = document.getElementById('main');
const createIframeButton = document.createElement('button');
createIframeButton.textContent = "Create Iframe";
createIframeButton.onclick = loadIframe;
createIframeButton.id = 'myButton';
main.appendChild(createIframeButton);