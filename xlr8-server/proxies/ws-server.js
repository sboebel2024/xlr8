const WebSocket = require("ws");
const { spawn, exec } = require("child_process");
const url = require("url");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
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

function setupUserSession(userId, ws) {

    if (users[userId]) {
        console.log(`♻️ Resuming existing session for ${userId}`);
        users[userId].ws = ws;
        return users[userId];
    }

    const display = getAvailableDisplay();
    console.log(`🚀 Starting session for user ${userId} on ${display}`);

    let xvfb = spawn("Xvfb", [display, "-screen", "0", "1920x1080x24", "-ac"]);
    console.log(`Xvfb display running on DISPLAY=${display}`);

    spawn("fluxbox", [], { env: { ...process.env, DISPLAY: display } });
    console.log(`🖥️  Fluxbox started on ${display}`);

    // Unique Chromium user profile
    const userProfile = `/tmp/chromium-${userId}`;
    exec(`rm -rf ${userProfile}`);
    console.log(`🌍 Chromium profile for ${userId} in ${userProfile}`);

    let chromium = spawn("chromium-browser", [
        "--no-sandbox",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "--disable-features=UserAgentClientHint",
        "--disable-background-networking",
        "--disable-popup-blocking",
        "--disable-site-isolation-trials",
        "--disable-usb-keyboard-detect", // 🔥 Prevents Chromium from blocking xdotool inputs
        `--user-data-dir=${userProfile}`,
        "--window-size=1920,1080",
        "--start-fullscreen",
        "--incognito",
        "https://www.overleaf.com"
    ], { env: { ...process.env, DISPLAY: display } });

    console.log(`🌍 Chromium started for user ${userId}, waiting for it to be ready...`);

    setTimeout(() => {
        console.log(`🎥 Starting FFmpeg for user ${userId}`);
        let ffmpeg = spawn("ffmpeg", [
            "-f", "x11grab",
            "-framerate", "20",
            "-draw_mouse", "0",
            "-s", "1920x1080",
            "-i", display,
            "-vf", "format=yuv420p",
            "-crf", "17",
            "-q:v", "7",
            "-update", "1",
            "-rtbufsize", "100M",
            "-vsync", "cfr",
            "-f", "mjpeg",
            "pipe:1"
        ]);

        ffmpeg.stdout.on("data", (data) => {
            if (users[userId]?.ws?.readyState === WebSocket.OPEN) {
                users[userId].ws.send(data);
            }
        });

        ffmpeg.stderr.on("data", (data) => {
            //console.error(`FFmpeg Error [User ${userId}]: ${data.toString()}`);
        });

        ffmpeg.on("close", (code) => {
            console.log(`❌ FFmpeg process for user ${userId} exited with code ${code}`);
        });

        users[userId].ffmpeg = ffmpeg;
    }, 5000);

    users[userId] = { xvfb, chromium, display, ws };
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

wss.on("connection", (ws, req) => {
    const params = new URLSearchParams(url.parse(req.url).query);
    let userId = params.get("userId");

    if (!userId) {
        console.warn("⚠️ User connected without a valid userId. Rejecting connection.");
        ws.close();
        return;
    }

    console.log(`🔗 Connected user ${userId}`);

    if (users[userId]) {
        users[userId].ws = ws;  // Reconnect WebSocket
        console.log(`♻️ Reconnecting existing session for ${userId}`);
    } else {
        // Start a new session only if the user doesn't already have one
        users[userId] = setupUserSession(userId, ws);
        console.log(`✅ Successfully started session for ${userId}`);
    }

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
                console.error(`❌ Failed to find Chromium window for ${display}: ${err}`);
                return;
            }
            const windowId = stdout.trim().split("\n")[0]; // Use the first matching window ID
            //console.log(`✅ Found Chromium window ${windowId} for ${display}`);

            console.log(`User Event @ Display ${display} w/ ID ${windowId}: ${message}`);

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
                    console.log(`Click event at x:${event.x}, y:${event.y} on DISPLAY=${display}`);
                    break;


                case "scroll":
                    if (event.deltaY > 0) {
                        exec(`DISPLAY=${display} xdotool click --window ${windowId} 5`); // Scroll down
                    } else {
                        exec(`DISPLAY=${display} xdotool click --window ${windowId} 4`); // Scroll up
                    }
                    break;

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
