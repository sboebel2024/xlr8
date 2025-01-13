document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM fully loaded and parsed');

    // Check if document.body exists
    if (!document.body) {
        console.error('document.body is not available');
        return;
    }

    // Create a MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log('DOM Mutation:', mutation);
        });
    });

    // Observe the document body
    observer.observe(document.body, { childList: true, subtree: true });
});
