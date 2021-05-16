chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.notifications.create('', {
            title: 'My Dearest Aesthetic Minimalist Friend',
            type: "basic",
            iconUrl: "icons/icon_48.png",
            message: 'Click the extension icon to show/hide bookmarks names! Tune behavior in Options \n\n(PRO TIP: for the safety of your bookmarks please backup them before the first use).',
            requireInteraction: true
        });
    } else if (details.reason === "update") {
        if (details.previousVersion === "1.0") {
            chrome.notifications.create('', {
                title: 'My Dearest Aesthetic Minimalist Friend',
                type: "basic",
                iconUrl: "icons/icon_48.png",
                message: "\n\nNow I'm going to restore titles in your subfolders, as this is something many folks were asking for \n\nYou can now tune this hiding behavior in Options",
                requireInteraction: true
            });
            console.debug("Unhiding the titles in subfolders...")
            runExtension();
            runExtension();
        }
    }
});

chrome.browserAction.onClicked.addListener((tab) => {
    runExtension()
});

let runExtension = () => {
    chrome.storage.local.get({'namesOn': true, 'bookmarksBarOnly': true}, (data) => {
        let putNamesOnWithLastClick = data['namesOn'];
        let bookmarksBarOnly = data['bookmarksBarOnly'];
        if (putNamesOnWithLastClick) {
            chrome.storage.local.set({'namesOn': false}, () => {
                takeNamesOff(bookmarksBarOnly);
            });
        } else {
            chrome.storage.local.set({'namesOn': true}, () => {
                putNamesOn(bookmarksBarOnly);
            });
        }
    });
}

let takeNamesOff = (bookmarksBarOnly) => {
    console.debug("Taking titles off...")
    chrome.bookmarks.getTree((bookmarkTree) => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        if (bookmarksBarOnly) {
            console.debug("bookmarks bar items only")
            performOnlyFor(bookmarkBar, takeNameOff);
        } else {
            console.debug("every item")
            performForAllIn(bookmarkBar, takeNameOff);
        }
    });
}

let putNamesOn = (bookmarksBarOnly) => {
    console.debug("Putting titles back for...")
    chrome.bookmarks.getTree((bookmarkTree) => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        if (bookmarksBarOnly) {
            console.debug("bookmarks bar items only")
            performOnlyFor(bookmarkBar, putNameOn);
        } else {
            console.debug("every item")
            performForAllIn(bookmarkBar, putNameOn);
        }
    });
}

let performOnlyFor = (node, action) => {
    for (let i = 0; i < node['children'].length; i++) {
        let bookmarkBarItem = node['children'][i];
        action(bookmarkBarItem);
    }
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
    if (!node['title']) {
        return;
    }
    original[node['id']] = node['title'];

    chrome.storage.local.set(original, () => {
        chrome.bookmarks.update(node.id, {'title': ''});
    });
}

let putNameOn = (node) => {
    chrome.storage.local.get(null, (data) => {
        let originalTitle = data[node.id];
        if (originalTitle) {
            chrome.bookmarks.update(node.id, {'title': originalTitle});
        }
    });
}
