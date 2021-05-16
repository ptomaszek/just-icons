// Saves options to chrome.storage
function save_options() {
    let bookmarksBarOnly = document.getElementById('bookmarksBarOnly').checked;
    chrome.storage.local.set({
        bookmarksBarOnly: bookmarksBarOnly,
    }, function () {
        let status = document.getElementById('status');
        status.textContent = 'Options saved';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.local.get({
        bookmarksBarOnly: true
    }, function (items) {
        document.getElementById('bookmarksBarOnly').checked = items.bookmarksBarOnly;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
