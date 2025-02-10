const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3254;

// 🔹 Use a writable directory instead of `__dirname`
const BASE_DIR = path.join(os.tmpdir(), "localproxy");
const UPLOAD_DIR = path.join(BASE_DIR, "uploads");

// ✅ Ensure directories exist (outside the snapshot)
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 🔹 File Upload Setup
const upload = multer({ dest: UPLOAD_DIR });

// 🔹 WebSocket Server
const wss = new WebSocket.Server({ port: PORT });

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
                // 🔹 Execute Command
                exec(data.command, (error, stdout, stderr) => {
                    if (error) {
                        ws.send(JSON.stringify({ error: stderr || error.message }));
                    } else {
                        ws.send(JSON.stringify({ output: stdout.trim() }));
                    }
                });
            } else if (data.action === "upload") {
                // 🔹 Receive File Upload (Base64)
                const { filename, content } = data;
                if (!filename || !content) return ws.send(JSON.stringify({ error: "Invalid upload request" }));

                const filePath = path.join(UPLOAD_DIR, filename);
                fs.writeFile(filePath, Buffer.from(content, "base64"), (err) => {
                    if (err) ws.send(JSON.stringify({ error: "File save failed" }));
                    else ws.send(JSON.stringify({ success: `File saved at ${filePath}` }));
                });
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
