const extensionScopeDefaults = {
    bookmarksBar_applyToFolders : true,
    bookmarksBar_applyToPages : true,
    inside_applyToFolders : true,
    inside_applyToPages : true
};

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
        console.debug("Installing...")
        chrome.notifications.create('', {
            title: 'My Dearest Aesthetic Minimalist Friend',
            type: "basic",
            iconUrl: "icons/icon_48.png",
            message: 'Click the extension icon to show/hide bookmarks names! Tune behavior in Options \n\n(PRO TIP: for the safety of your bookmarks please backup them before the first use).'
        },
        () => chrome.runtime.openOptionsPage());
    } else if (details.reason === "update") {
        console.debug("Updating...")
        if (details.previousVersion === "1.2.1") {
            chrome.notifications.create('', {
                title: 'My Dearest Aesthetic Minimalist Friend',
                type: "basic",
                iconUrl: "icons/icon_48.png",
                message: "Now you can tune even more hiding behaviors in Options!"
            },
            () => chrome.runtime.openOptionsPage());
        }
    }
});

chrome.action.onClicked.addListener(() => {
    runExtension()
    .catch(e => {
        console.error(e);
    });
});

let runExtension = () => {
    return getFromLocal({ namesOn: true })
    .then(data => {
        let namesOnCurrently = data['namesOn'];

        if (namesOnCurrently) {
            return takeNamesOff()
                .then(setInLocal({'namesOn': false}))
        } else {
            putNamesOn()
                .then(setInLocal({'namesOn': true}))
        }
    });
}

let takeNamesOff = () => {
    console.debug("Taking titles off...");

    return Promise.all([
           getBookmarksBar(),
           getFromLocal({ extensionScope : extensionScopeDefaults }).then(data => Promise.resolve(data.extensionScope))
        ]).then(([bookmarksBar, extensionScope]) => {
            return performFor(bookmarksBar, takeNameOff, (node) => meetsHidingCriteria(node, extensionScope));
    });
}

let meetsHidingCriteria = (node, scope) => {
    return (
          (scope.bookmarksBar_applyToFolders && isOnBookmarksBar(node) && isFolder(node))
          || (scope.bookmarksBar_applyToPages && isOnBookmarksBar(node) && !isFolder(node))
          || (scope.inside_applyToFolders && !isOnBookmarksBar(node) && isFolder(node))
          || (scope.inside_applyToPages && !isOnBookmarksBar(node) && !isFolder(node))
    );
}

let putNamesOn = () => {
    console.debug("Putting titles back...")

    return getBookmarksBar()
        .then(bookmarksBar => {
             return performFor(bookmarksBar, putNameOn, (node) => { return true });
        });
}

let isOnBookmarksBar = (bookmark) => {
    return bookmark.parentId == 1;
}

let isFolder = (bookmark) => {
    return !Object.hasOwn(bookmark, 'url');
}

let getBookmarksBar = () => {
    return chrome.bookmarks.getTree()
        .then(tree => Promise.resolve(tree[0]['children'][0]));
}

let performFor = (node, action, criteria) => {
    const promises = [];

    if (node.hasOwnProperty('children')) {
        for (let i = 0; i < node['children'].length; i++) {
            let folder = node['children'][i];

            if (criteria(folder)) {
                promises.push(action(folder));
            }

            promises.push(performFor(folder, action, criteria));
        }
    } else {
        if (criteria(node)) {
            promises.push(action(node));
        }
    }

    return Promise.all(promises);
}

let takeNameOff = (node) => {
    let original = {};
    if (!node['title']) { // as a safety measure, do not save an empty title
        return Promise.resolve();
    }
    original[node['id']] = node['title'];

    return setInLocal(original)
    .then(() => {
        return chrome.bookmarks.update(node.id, {'title': ''});
    });
}

let putNameOn = (node) => {
    if (node['title']) { // as a safety measure, do not restore title if already exists
        return Promise.resolve();
    }

    return getFromLocal(null)
    .then(data => {
        let originalTitle = data[node.id];
        if (originalTitle) {
            return chrome.bookmarks.update(node.id, {'title': originalTitle})
        }
        return Promise.resolve();
    });
}

let setInLocal = (key, value) => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.set(key, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        })
    );
}

let getFromLocal = (query) => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.get(query, items => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(items);
            }
        })
    );
}
