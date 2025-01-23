// Post route to handle talking to server
async function editFileContent(fileId, newContent, newFileName, newOwnerId = null) {
    const url = '/user-dashboard/edit-file-content';
    const payload = {
        file_id: fileId,
        content: newContent,
        newFileName: `${newFileName}.des`
    };
    console.log(fileId);

    // Add optional parameters if provided
    
    if (newOwnerId) {
        payload.newOwnerId = newOwnerId;
    } else {
        payload.newOwnerId = null;
    }

    try {
        // Send a POST request to the server
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Parse the JSON response
        const result = await response.json();

        // Handle the response
        if (response.ok) {
            console.log('File edited successfully:', result);
        } else {
            console.error('Error editing file:', result.message);
        }

        window.location.reload();
        return result;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { status: 'NOK', message: 'An unexpected error occurred' };
    }
}