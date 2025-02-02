chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.action === "setCookie") {
        chrome.cookies.set({
            url: "https://www.overleaf.com",
            name: "overleaf_session2",
            value: request.cookieValue,
            domain: ".overleaf.com",
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "no_restriction"
        }, (cookie) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Chrome Extension Error:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                console.log("✅ Successfully Set Cookie in Chrome Extension!");
                sendResponse({ success: true });
            }
        });
        return true;
    }
});
