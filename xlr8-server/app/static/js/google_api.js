const clientId = "YOUR_CLIENT_ID_HERE"; // Replace with your client ID

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }
    );
};
