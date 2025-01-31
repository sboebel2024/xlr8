async function fetchFileData(isCards) {
    try {
        const requestData = {
            isCards: isCards
        };
        const response = await fetch('/user-dashboard/get-file-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if(!response.ok) {
            //throw new Error(`Error: ${response.status} - ${response.statusText}`);
            return { error: `Error: ${response.status}` };
        }

        const fileData = await response.json();
        console.log('File Data', fileData);
        return fileData
    } catch (error) {
        //console.error('Error fetching file data:', error);
        return { error: 'An unexpected error occurred.' };
    }
}

async function createFile(type, fileName) {
    try {
        const requestBody = {
            fileName: fileName,
            content: "",
            type: type
        };

        const response = await fetch('/user-dashboard/create-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to create file: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        updateFileList(isCards);

        if (data.status === "OK") {
            console.log('File created successfully:', data.file);
            return data.file; // Return the created file object
        } else {
            console.error('Error creating file:', data.message);
            return null;
        }

    } catch (error) {
        console.error('Error creating file:', error);
    }
}


async function delete_file(file_id) {
    try {
        const requestData = {
            file_id: file_id
        };
        const response = await fetch('/user-dashboard/delete-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if(!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const fileData = await response.json();
        updateFileList(isCards);
        console.log(fileData);
        return fileData;

    

    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

async function updateFileList(isCards) {
    try {
        // Fetch the latest file data
        const data = await fetchFileData(isCards);

        // Render the updated file list
        try {
            renderFileList(data.recent_files);
        } catch {
            renderFileList(null);
        }
    } catch (error) {
        console.error('Error updating file list:', error);
    }
}
