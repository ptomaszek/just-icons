const extensionScopeDefaults = {
    bookmarksBar_applyToFolders : true,
    bookmarksBar_applyToPages : true,
    inside_applyToFolders : true,
    inside_applyToPages : true
};

// Saves options to chrome.storage
function save_options() {
    chrome.storage.local.set({
        extensionScope: {
            bookmarksBar_applyToFolders: document.getElementById('bookmarksBar_applyToFolders').checked,
            bookmarksBar_applyToPages: document.getElementById('bookmarksBar_applyToPages').checked,
            inside_applyToFolders: document.getElementById('inside_applyToFolders').checked,
            inside_applyToPages: document.getElementById('inside_applyToPages').checked
        },
    }, function () {
        let status = document.getElementById('status');
        status.textContent = 'Options saved';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.local.get({ extensionScope: {} }, function (items) {
        const finalScope = { ...extensionScopeDefaults, ...items.extensionScope }; // merge with defaults

        document.getElementById('bookmarksBar_applyToFolders').checked = finalScope.bookmarksBar_applyToFolders;
        document.getElementById('bookmarksBar_applyToPages').checked = finalScope.bookmarksBar_applyToPages;
        document.getElementById('inside_applyToFolders').checked = finalScope.inside_applyToFolders;
        document.getElementById('inside_applyToPages').checked = finalScope.inside_applyToPages;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
