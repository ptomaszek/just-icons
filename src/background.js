chrome.runtime.onInstalled.addListener(details => {
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
            return getFromLocal('namesOn')
            .then(resp => {
                if (resp.namesOn) { //if titles shown, do nothing
                    return Promise.resolve()
                }
                // if titles hidden
                console.debug("Unhiding the titles in subfolders...")
                return putNamesOn(false)
                .then(takeNamesOff(true))
            })
            .catch(e => {
                console.error(e);
            });
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
    return getFromLocal({'namesOn': true, 'bookmarksBarOnly': true})
    .then(data => {
        let putNamesOnWithLastClick = data['namesOn'];
        let bookmarksBarOnly = data['bookmarksBarOnly'];
        if (putNamesOnWithLastClick) {
            return takeNamesOff(bookmarksBarOnly)
            .then(setInLocal({'namesOn': false}))
        } else {
            putNamesOn(bookmarksBarOnly)
            .then(setInLocal({'namesOn': true}))
        }
    });
}

let takeNamesOff = (bookmarksBarOnly) => {
    console.debug("Taking titles off...")

    return chrome.bookmarks.getTree()
    .then(bookmarkTree => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        if (bookmarksBarOnly) {
            console.debug("bookmarks bar items only")
            return performOnlyFor(bookmarkBar, takeNameOff);
        } else {
            console.debug("every item")
            return performForAllIn(bookmarkBar, takeNameOff);
        }
    });
}

let putNamesOn = (bookmarksBarOnly) => {
    console.debug("Putting titles back for...")

    return chrome.bookmarks.getTree()
    .then(bookmarkTree => {
        let bookmarkBar = bookmarkTree[0]['children'][0];
        if (bookmarksBarOnly) {
            console.debug("bookmarks bar items only")
            return performOnlyFor(bookmarkBar, putNameOn);
        } else {
            console.debug("every item")
            return performForAllIn(bookmarkBar, putNameOn);
        }
    });
}

let performOnlyFor = (node, action) => {
    const promises = [];

    for (let i = 0; i < node['children'].length; i++) {
        let bookmarkBarItem = node['children'][i];
        promises.push(action(bookmarkBarItem));
    }

    return Promise.all(promises)
}

let performForAllIn = (node, action) => {
    const promises = [];

    if (node.hasOwnProperty('children')) {
        for (let i = 0; i < node['children'].length; i++) {
            let folder = node['children'][i];
            promises.push(action(folder))
            promises.push(performForAllIn(folder, action));
        }
    } else {
        promises.push(action(node));
    }

    return Promise.all(promises)
    .then((results) => {
        console.log("All done", results);
    })

}

let takeNameOff = (node) => {
    let original = {};
    if (!node['title']) {
        return Promise.resolve();
    }
    original[node['id']] = node['title'];

    return setInLocal(original)
    .then(() => {
        return chrome.bookmarks.update(node.id, {'title': ''});
    });
}

let putNameOn = (node) => {
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
