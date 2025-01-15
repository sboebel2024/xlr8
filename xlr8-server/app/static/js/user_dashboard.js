document.getElementById('sendRequest').addEventListener('click', function() {
    const file_id = 1;
    window.location.href = `/user-dashboard/access-file?file_id=${file_id}`;
});
