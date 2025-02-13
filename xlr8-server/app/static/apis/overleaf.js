const RDP_PORT = 9222;
const RDP_HOST = "localhost";
var currExtensor = 0;

window.commands = window.commands || {};
window.commands["ovlf"] = {
    checkOverleafTitleAndURL: null,


    getFile: function () {
        return `powershell -Command "Get-Process | Where-Object {$_.ProcessName -match 'chrome|msedge'} | Select-Object MainWindowTitle"`;
    },

    // Pass OwnerId to this instead of userId so we can open any file
    openFile: function (userId, fileId, ws) {
        console.log(`📂 Fetching Overleaf project extensor for file: ${fileId}`);
    
        fetch(`/api-routes/set-extensor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_id: fileId })
        })
        .then(response => response.json())
        .then(extData => {
            let extensor = extData.status === "OK" ? extData.extensor : "";
            console.log(`✅ Found Overleaf extensor: ${extensor}`);
    
            // Fetch the user profile ZIP
            return fetch(`/api-routes/get-user-profile?user_id=${userId}&file_id=${fileId}`)
                .then(response => response.json())
                .then(profileData => ({ extensor, userProfileZip: profileData.status === "OK" ? profileData.user_profile : null }));
        })
        .then(({ extensor, userProfileZip }) => {
            const overleafUrl = `https://www.overleaf.com/project/${extensor}`;
            console.log(`🚀 Opening Overleaf at: ${overleafUrl}`);
            if (userProfileZip) {
                console.log("User Profile found");
            } else {
                console.log('User Profile not found.');
            }

            // 🔹 1st WebSocket Command: Create the user profile directory
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    command: `mkdir "%UPLOAD_DIR%\\uploads\\${userId}-profile"`,
                    password: "password"
                }));
                console.log(`✅ Directory creation command sent: mkdir "uploads\\${userId}-profile"`);
            } else {
                console.error("❌ WebSocket is not open!");
                return;
            }
            const chromeCommand = `chrome.exe --remote-debugging-port=9222 --user-data-dir="%UPLOAD_DIR%\\${userId}-profile" --app="${overleafUrl}`;

            setTimeout(() => {
                ws.send(JSON.stringify({
                    command: chromeCommand,
                    password: "password"
                }));
                console.log(`✅ Command sent: ${chromeCommand}`);
            }, 1000);

            this.startMonitoring(fileId, ws);
            
        })
        .catch(error => {
            console.error("❌ Failed to fetch Overleaf project or user profile:", error);
        });
    },

    startMonitoring: function (fileId, ws) {
        this.watchOverleafTab(fileId, ws);
    },

    watchOverleafTab: function (fileId, ws) {
        console.log("🔍 Monitoring Overleaf tab for project ID and file name...");

        const checkOverleafTitleAndURL = () => {
            if (ws.readyState !== WebSocket.OPEN) {
                console.error("❌ WebSocket disconnected, stopping monitoring.");
                clearInterval(this.overleafMonitorInterval);
                return;
            }

            // 🔹 Command to fetch open Chrome tabs
            const curlCommand = `curl -s http://localhost:9222/json`;

            ws.send(JSON.stringify({ command: curlCommand, password: "password" }));

            ws.onmessage = function (event) {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    console.warn("❌ Invalid WebSocket response format. Raw Response:", event.data);
                    return;  // Exit early if parsing fails
                }

                if (data.success) {
                    const jsonResponse = JSON.parse(data.success);
                    for (const tab of jsonResponse) {
                        if (tab.url.includes("overleaf.com/project/")) {
                            const url = tab.url;
                            const title = tab.title;

                            // ✅ Extract Extensor (Project ID)
                            const match = url.match(/overleaf\.com\/project\/([\w\d]+)/);
                            if (match) {
                                const extensor = match[1];
                                console.log(`✅ Extracted extensor: ${extensor}`);
                                if (currExtensor === 0) {
                                    currExtensor = extensor;
                                } else {
                                    // const fileName = title.replace(" - Online LaTeX Editor Overleaf", "").trim() + ".ovlf";
                                    // if (!(currExtensor === extensor)) {
                                    //     fetch(`/user-dashboard/create-file`, {
                                    //         method: "POST",
                                    //         headers: { "Content-Type": "application/json" },
                                    //         body: JSON.stringify({
                                    //             fileName: fileName,
                                    //             ext: "type",
                                    //         })
                                    //     })
                                    //     .then(response => response.json())
                                    //     .then(response => {
                                    //         console.log(`✅ File Created! FID before: ${fileId}`);
                                    //         fileId = response.file.id;
                                    //         console.log(`FID after: ${fileId}`);
                                    //     })
                                    //     .catch(error => console.error("❌ Failed to save extensor:", error));
                                        
                                    // }
                                }

                                fetch(`/api-routes/set-extensor`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ file_id: fileId, ext: extensor })
                                })
                                .then(response => response.json())
                                .then(response => {
                                    console.log(`✅ Extensor saved: ${response.extensor}`);
                                })
                                .catch(error => console.error("❌ Failed to save extensor:", error));
                            }

                            // ✅ Extract File Name
                            let fileName = title.replace(" - Online LaTeX Editor Overleaf", "").trim();
                            console.log(`📂 Extracted file name: ${fileName}`);

                            fetch(`/api-routes/set-name`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ file_id: fileId, name: fileName })
                            })
                            .then(response => response.json())
                            .then(response => {
                                console.log(`✅ File name saved: ${response.name}`);
                            })
                            .catch(error => console.error("❌ Failed to save file name:", error));
                        }
                    }
                }
            };
        };

        // 🔄 Start interval for checking Overleaf tab every 30 seconds
        this.overleafMonitorInterval = setInterval(checkOverleafTitleAndURL, 5000);
    }
};