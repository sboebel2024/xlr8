const WebSocket = require("ws");
const { spawn, exec, execSync } = require("child_process");
const url = require("url");
const path = require("path");
const os = require("os");
const express = require("express");
const { appendFile } = require("fs");
const fs = require("fs");
const app = express();

const homeDir = os.homedir();

const PORT = 9090;
const CURL_PORT = 3000;
const wss = new WebSocket.Server({ 
    port: PORT, 
    maxPayload: 32 * 1024 * 1024
});
const users = {}; // Stores active user sessions
const usedDisplays = new Set();

console.log(`📡 WebSocket Server started on ws://localhost:${PORT}`);

function getAvailableDisplay() {
    for (let i = 1000; i < 1100; i++) {
        let display = `:${i}`;
        if (!usedDisplays.has(display)) {
            usedDisplays.add(display);
            return display;
        }
    }
    throw new Error("No available displays!");
}

function setupUserSession(userId, ws, length, height, file) {

    let display;

    if (users[userId]) {
        users[userId].ffmpeg.kill();
        users[userId].xvfb.kill();
        users[userId].chromium.kill();
        console.log(`🛑 Stopping session for user ${userId}`);
        display = users[userId].display;
    } else {
        display = getAvailableDisplay();
    }
    
    let filePath;

    if ((!file) || (file === "None")) {
        filePath = 'https://overleaf.com/project';
    } else {
        filePath = file;
    }

    console.log(`filePath: ${filePath}`);

    
    console.log(`🚀 Starting session for user ${userId} on ${display}`);

    let xvfb = spawn("Xvfb", [display, "-screen", "0", `${length}x${height}x24`, "-ac"]);
    console.log(`Xvfb display running on DISPLAY=${display} with ${length}x${height}`);

    spawn("fluxbox", [], { env: { ...process.env, DISPLAY: display } });
    console.log(`🖥️  Fluxbox started on ${display}`);

    // Unique Chromium user profile
    const USER_PROFILES_DIR = "/app/cookies/user-profiles"
    const userProfile = path.join(USER_PROFILES_DIR, `chromium-${userId}`);
    console.log(`Expected Profile Path: ${USER_PROFILES_DIR}`);
    console.log(`Final User Profile Path: ${userProfile}`);
    console.log(`__dirname: ${__dirname}`);
    execSync(`mkdir -p ${userProfile}`);
    console.log(`📁 Using persistent profile for ${userId}: ${userProfile}`);

    console.log(`🌍 Chromium profile for ${userId} in ${userProfile}`);

    // ✅ Ensure Default directory exists
    const displayNumber = parseInt(display.replace(":", ""), 10);
    const rdp = 9222 + (displayNumber - 1000);

    try {
        execSync(`rm -rf ${userProfile}/SingletonLock ${userProfile}/SingletonSocket ${userProfile}/SingletonCookie`);
        console.log(`✅ Forced unlock of Chromium profile: ${userProfile}`);
    } catch (error) {
        console.error(`❌ Could not remove lock files`, error);
    }

    console.log(`${filePath}`);

    let chromiumArgs = [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-infobars",
        "--test-type",
        `--remote-debugging-port=${rdp}`,
        "--remote-debugging-address=0.0.0.0",
        `--window-size=${length},${height}`,
        `--user-data-dir=${userProfile}`,
        "--start-fullscreen",
        "--disable-usb-keyboard-detect",
        "--disable-gpu",
        `${filePath}`
    ];

    const chromiumPath = "/usr/bin/chromium-browser";

    let chromium = spawn(chromiumPath, chromiumArgs, { env: { ...process.env, DISPLAY: display } });
    
    chromium.on("error", (error) => {
        console.error(`❌ Chromium failed to start: ${error.message}`);
    });

    chromium.stderr.on("data", (data) => {
        console.error(`Chromium stderr: ${data}`);
    });

    // ✅ Log if Chromium exits early
    chromium.on("exit", (code, signal) => {
        console.log(`⚠️ Chromium exited with code ${code}, signal ${signal}`);
    });

    console.log(`🌍 Chromium started for user ${userId} and size ${length}x${height}, waiting for it to be ready...`);

    setTimeout(() => {
        console.log(`🎥 Starting FFmpeg for user ${userId}`);
        let ffmpeg = spawn("ffmpeg", [
            "-f", "x11grab",
            "-framerate", "40",
            "-draw_mouse", "0",
            "-s", `${length}x${height}`,
            "-i", display,
            "-vf", "format=rgb24",
            "-crf", "17",
            "-q:v", "8",
            "-update", "1",
            "-rtbufsize", "64M",
            "-preset", "slow",
            "-chunk_size", "128000",
            "-vsync", "cfr",
            "-f", "mjpeg",
            "pipe:1"
        ]);
        
        
// sample
        console.log(`FFmpeg started with size ${length}x${height},`);

        ffmpeg.stdout.on("data", (data) => {
            if (users[userId]?.ws?.readyState === WebSocket.OPEN) {
                users[userId].ws.send(data, { fragmentOutgoingMessages: false });
                //users[userId].ws.send(Buffer.alloc(2 * 1024 * 1024), { fragmentOutgoingMessages: false }); // TEST
            }
        });

        ffmpeg.stderr.on("data", (data) => {
            console.error(`FFmpeg Error [User ${userId}]: ${data.toString()}`);
        });

        ffmpeg.on("close", (code) => {
            console.log(`❌ FFmpeg process for user ${userId} exited with code ${code}`);
        });

        users[userId].ffmpeg = ffmpeg;
    }, 1000);

    users[userId] = { xvfb, chromium, display, ws, rdp };
    return users[userId];
}

setInterval(() => {
    console.log("🔍 Active Sessions:");
    console.table(
        Object.entries(users).map(([userId, session]) => ({
            userId,
            display: session.display,
            hasWS: session.ws?.readyState === WebSocket.OPEN ? "✅" : "❌",
            hasChromium: session.chromium ? "✅" : "❌",
            hasFFmpeg: session.ffmpeg ? "✅" : "❌"
        }))
    );
}, 10000); // Prints every 10 seconds

async function getUserPage(userId) {
    if (!users[userId]) {
        console.error(`❌ User ${userId} not found`);
        return null; // Ensure function returns a value
    }

    const { rdp } = users[userId]; // Remote Debugging Port

    try {
        const response = await fetch(`http://localhost:${rdp}/json`);
        const pages = await response.json();

        if (!Array.isArray(pages)) {
            console.error("❌ Unexpected response format:", pages);
            return null;
        }

        // ✅ Improved filtering logic
        const overleafPage = pages.find(page => {
            if (!page.url) return false;
            return page.url.startsWith("https://www.overleaf.com/project/");
        });

        if (overleafPage) {
            console.log(`✅ User ${userId} is viewing Overleaf: ${overleafPage.url}`);
            return overleafPage.url;
        } else {
            console.warn(`⚠️ No valid Overleaf project found for user ${userId}`);
            return null;
        }

    } catch (error) {
        console.error(`❌ Error fetching page data for user ${userId}:`, error);
        return null;
    }
}

let scrollYBuffer = 0;
let scrollXBuffer = 0;


app.get("/get-overleaf-url/:userId", async (req, res) => {
    const userId = req.params.userId;
    console.log(`User ID: ${userId}`);
    const response = await getUserPage(userId);
    return res.json({ userId, overleafUrl: response});
});

app.listen(CURL_PORT, () => {
    console.log(`✅ Express server running on http://localhost:${PORT}`);
});

wss.on("connection", (ws, req) => {
    const params = new URLSearchParams(url.parse(req.url).query);
    let userId = params.get("userId");
    let length = params.get("length");
    let height = params.get("height");
    let file = params.get("file");

    if (!userId) {
        console.warn("⚠️ User connected without a valid userId. Rejecting connection.");
        ws.close();
        return;
    }

    console.log(`🔗 Connected user ${userId}`);

    // Start a new session only if the user doesn't already have one
    users[userId] = setupUserSession(userId, ws, length, height, file);
    console.log(`✅ Successfully started session for ${userId}`);

    ws.on("message", (message) => {
        
        const event = JSON.parse(message);
        const userSession = users[event.userId];

        if (!userSession) {
            console.warn(`⚠️ No session found for user ${event.userId}`);
            return;
        }

        const display = userSession.display;

        // Activate the correct Chromium window
        exec(`DISPLAY=${display} xdotool getactivewindow`, (err, stdout) => {
            if (err || !stdout.trim()) {
                //console.error(`❌ Failed to find Chromium window for ${display}: ${err}`);
                return;
            }
            const windowId = stdout.trim().split("\n")[0]; // Use the first matching window ID
            //console.log(`✅ Found Chromium window ${windowId} for ${display}`);

            //console.log(`User Event @ Display ${display} w/ ID ${windowId}: ${message}`);

            let key = event.key;
            const keyMap = {
                "Backspace": "BackSpace",
                "Enter": "Return",
                "Space": "space",
                "Shift": "Shift_L",
                "Control": "Control_L",
                "Alt": "Alt_L",
                "Tab": "Tab",
                "Escape": "Escape",
                "ArrowUp": "Up",
                "ArrowDown": "Down",
                "ArrowLeft": "Left",
                "ArrowRight": "Right"
            };

            if (keyMap[key]) {
                key = keyMap[key];
            }

            if (event.type === "keydown") {
                if (key.length === 1) {
                    // If it's a single character, use 'xdotool type'
                    exec(`DISPLAY=${display} xdotool windowactivate ${windowId} type --delay 0 '${key}'`);
                } else {
                    // If it's a special key, use 'keydown'
                    exec(`DISPLAY=${display} xdotool windowactivate ${windowId} keydown ${key}`);
                }
            } else if (event.type === "keyup") {
                exec(`DISPLAY=${display} xdotool windowactivate ${windowId} keyup ${key}`);
            }


            switch (event.type) {
                case "mousemove":
                    exec(`DISPLAY=${display} xdotool mousemove --window ${windowId} ${Math.round(event.x)} ${Math.round(event.y)}`);
                    break;

                case "mousedown":
                case "mouseup":
                    let clickType = event.type === "mousedown" ? "mousedown" : "mouseup";
                    exec(`DISPLAY=${display} xdotool windowactivate --sync ${windowId} mousemove --window ${windowId} ${Math.round(event.x)} ${Math.round(event.y)} ${clickType} ${event.button + 1}`);
                    //console.log(`Click event at x:${event.x}, y:${event.y} on DISPLAY=${display}`);
                    break;


                    case "scroll":
                        const scrollThreshold = 50; // Adjust for how much scroll is needed before action
                        let accumulatedScrollY = (globalThis.accumulatedScrollY || 0) + event.deltaY;
                        let accumulatedScrollX = (globalThis.accumulatedScrollX || 0) + event.deltaX;
                    
                        // Vertical scrolling
                        while (Math.abs(accumulatedScrollY) >= scrollThreshold) {
                            const direction = accumulatedScrollY > 0 ? 5 : 4; // 5 = Down, 4 = Up
                            exec(`DISPLAY=${display} xdotool click --window ${windowId} ${direction}`);
                            accumulatedScrollY -= Math.sign(accumulatedScrollY) * scrollThreshold; // Reduce accumulated scroll
                        }
                    
                        // Horizontal scrolling (if needed)
                        while (Math.abs(accumulatedScrollX) >= scrollThreshold) {
                            const direction = accumulatedScrollX > 0 ? 7 : 6; // 7 = Right, 6 = Left
                            exec(`DISPLAY=${display} xdotool click --window ${windowId} ${direction}`);
                            accumulatedScrollX -= Math.sign(accumulatedScrollX) * scrollThreshold; // Reduce accumulated scroll
                        }
                    
                        // Store accumulated values globally for next scroll event
                        globalThis.accumulatedScrollY = accumulatedScrollY;
                        globalThis.accumulatedScrollX = accumulatedScrollX;
                        break;

                // case "scroll":
                //     if (event.deltaY > 0) {
                //         exec(`DISPLAY=${display} xdotool click --window ${windowId} 5`); // Scroll down
                //     } else if (event.deltaY < 0) {
                //         exec(`DISPLAY=${display} xdotool click --window ${windowId} 4`); // Scroll up
                //     }

                //     if (event.deltaX > 0) {
                //         exec(`DISPLAY=${display} xdotool click --window ${windowId} 7`); // Scroll right (if supported)
                //     } else if (event.deltaX < 0) {
                //         exec(`DISPLAY=${display} xdotool click --window ${windowId} 6`); // Scroll left (if supported)
                //     }
                //     break;



            }
        });
    });

    ws.on("close", () => {
        console.log(`❌ User ${userId} disconnected.`);

        setTimeout(() => {
            if (users[userId] && users[userId].ws.readyState !== WebSocket.OPEN) {
                console.log(`🛑 Stopping session for user ${userId} (Timeout Expired)`);
                stopUserSession(userId);
            }
        }, 604800000); // 1 week timeout before full cleanup
    });
});

function stopUserSession(userId) {
    if (users[userId]) {
        if (users[userId].ffmpeg) users[userId].ffmpeg.kill();
        if (users[userId].xvfb) users[userId].xvfb.kill();
        console.log(`🛑 Stopping session for user ${userId}`);
        if (users[userId].chromium) users[userId].chromium.kill();
        usedDisplays.delete(users[userId].display);
        delete users[userId];  // Fully remove session
    }
}




function cleanup() {
    console.log("\n🛑   Server shutting down... Cleaning up processes!");

    // Kill FFmpeg, Xvfb, and Chromium for all users
    Object.keys(users).forEach((userId) => {
        console.log(`🛑   Stopping session for user ${userId}`);
        if (users[userId].ffmpeg) users[userId].ffmpeg.kill();
        if (users[userId].chromium) users[userId].chromium.kill();
        if (users[userId].xvfb) users[userId].xvfb.kill();
    });

    // Kill orphaned processes (manual cleanup)
    try {
        execSync("pkill -f ffmpeg || true", { stdio: "ignore" });   // Kill all FFmpeg processes (suppress error)
        execSync("pkill -f Xvfb", { stdio: "ignore" });     // Kill all Xvfb instances
        execSync("pkill -f chromium", { stdio: "ignore" }); // Kill all Chromium instances
    } catch (error) {
        console.log("⚠️   Cleanup warning: Some processes may have already been stopped (or were never started).");
    }

    console.log("✅   Cleanup complete. Exiting...");
    
}

// Handle Ctrl+C (SIGINT) and process termination (SIGTERM)
process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
});

process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
});