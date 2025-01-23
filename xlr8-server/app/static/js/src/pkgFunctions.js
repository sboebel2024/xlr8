async function logUserOut(userId) {

    const payload = {
        user_id: userId
    };

    fetch('/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Logged out!')
        window.location.href = `/user-dashboard/`
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function logUserIn() {
    window.location.href = `/login/render-login`;
}

function linkToDashboard() {
    window.location.href = '/user-dashboard/'
}

function adjustInputWidth(form) {
    const charWidth = 10;
    const padding = 20;
    const contentLength = form.value.length;
    const width = contentLength*charWidth + padding;
    if (width > 150) {
        form.style.width = '150px';
    } else {
        form.style.width = `${width}px`;
    }
}

async function changeFilename(newName) {
    try {
        const sanitizedFileName = newName.replace(/[^a-zA-Z0-9_]/g, '');
        const newFileName = `${sanitizedFileName}.des`;

        const payload = {
            file_id: fileId,
            newFileName: newFileName
        };

        const response = await fetch('/user-dashboard/edit-file-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('File edited successfully:', result);
        } else {
            console.error('Error editing file:', result.message);
        }

        return result;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { status: 'NOK', message: 'An unexpected error occurred' };
    }
}
