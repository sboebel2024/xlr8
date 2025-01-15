const apiKey = 'AIzaSyDoI5J68HHw-AP5SHVXRFSnhMBlnUP6j_g';
const clientId = "261551392822-lahsvlhlui2u2f6qb6dkif7qteronilq.apps.googleusercontent.com";


function initGoogleAPI() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: apiKey, // Replace with your API key
            clientId: clientId, // Replace with your Client ID
            scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file'
        }).then(() => {
            const authInstance = gapi.auth2.getAuthInstance();
            document.getElementById('authButton').onclick = () => {
                authInstance.signIn().then(() => {
                    document.getElementById('createDocButton').disabled = false;
                });
            };
        }).catch((error) => {
            console.error('Error initializing Google API:', error);
        });
    });
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
