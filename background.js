chrome.runtime.onInstalled.addListener((object) => {
    chrome.notifications.create('', {
        title: 'My Dearest Aesthetic Minimalist Friend',
        type: "basic",
        iconUrl: "icons/icon_48.png",
        message: 'Click the extension icon to show/hide bookmarks names! \n\n(PRO TIP: for the safety of your bookmarks please backup them before the first use).',
        contextMessage: 'Feel free to dismiss the popup now.',
        requireInteraction: true
    });
});

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.storage.local.get({'namesOn': true}, (data) => {
        if (data['namesOn']) {
            chrome.storage.local.clear(() => {
                chrome.storage.local.set({'namesOn': false}, () => {
                    takeNamesOff();
                });
            });
        } else {
            chrome.storage.local.set({'namesOn': true}, () => {
                putNamesOn();
            });
        }
    });
});

let takeNamesOff = () => {
    console.debug("Taking titles off...")
    chrome.bookmarks.getTree((bookmarkTree) => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        performForAllIn(bookmarkBar, takeNameOff);
    });
}

let putNamesOn = () => {
    chrome.bookmarks.getTree((bookmarkTree) => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        performForAllIn(bookmarkBar, putNameOn);
    });
}

let performForAllIn = (node, action) => {
    if (node.hasOwnProperty('children')) {
        for (let i = 0; i < node['children'].length; i++) {
            let folder = node['children'][i];
            action(folder);
            performForAllIn(folder, action);
        }
    } else {
        action(node);
    }
}

let takeNameOff = (node) => {
    let original = {};
    original[node['id']] = node['title'];

    chrome.storage.local.set(original, () => {
        chrome.bookmarks.update(node.id, {'title': ''});
    });
}

let putNameOn = (node) => {
    console.debug("Putting titles back...")
    chrome.storage.local.get(null, (data) => {
        let originalTitle = data[node.id];
        chrome.bookmarks.update(node.id, {'title': originalTitle});
    });
}
