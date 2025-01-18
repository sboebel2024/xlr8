const apiKey = 'AIzaSyDoI5J68HHw-AP5SHVXRFSnhMBlnUP6j_g';
const clientId = "261551392822-lahsvlhlui2u2f6qb6dkif7qteronilq.apps.googleusercontent.com";


function initGoogleAPI() {
    if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
        setTimeout(initGoogleAPI, 50); // Retry after 50ms
        return;
    }


    google.accounts.id.initialize({
        client_id: clientId, // Your Client ID
        callback: handleCredentialResponse
    });

    console.log("Initialized!")

    // Render the "Sign In" button
    google.accounts.id.renderButton(
        document.getElementById('authButton'), // The element where the button appears
        { theme: 'outline', size: 'large' }
    );
}

function handleCredentialResponse(response) {
    console.log('Encoded JWT ID token:', response.credential);
    // Use the response to authenticate with your backend if needed
}

function createDocument() {
    gapi.client.docs.documents.create({
        title: 'My New Document'
    }).then(response => {
        const documentId = response.result.documentId;
        console.log('Document created with ID:', documentId);

        // Embed the document in an iframe
        const iframe = document.getElementById('docViewer');
        iframe.src = `https://docs.google.com/document/d/${documentId}/edit`;
    }).catch(error => {
        console.error('Error creating document:', error);
    });
}

function saveChanges() {
    const documentId = documentId; // Replace with your document ID
    const requests = [
        {
            insertText: {
                location: { index: 1 },
                text: 'Hello, World!'
            }
        }
    ];

    gapi.client.docs.documents.batchUpdate({
        documentId: documentId,
        requests: requests
    }).then(response => {
        console.log('Document updated successfully:', response);
    }).catch(error => {
        console.error('Error updating document:', error);
    });
}

window.onload = () => {
    initGoogleAPI();
    document.getElementById('saveButton').onclick = () => saveChanges(documentId);
};
