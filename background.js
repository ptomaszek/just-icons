chrome.runtime.onInstalled.addListener(function (object) {
    chrome.notifications.create('', {
        title: 'My Dearest Aesthetic Minimalist Friend',
        type: "basic",
        iconUrl: "icons/icon_48.png",
        message: 'Click the extension icon to show/hide bookmarks names! \n\n(PRO TIP: for the safety of your bookmarks please backup them before the first use).',
        contextMessage: 'Feel free to dismiss the popup now.',
        requireInteraction: true
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get({'namesOn' : true}, function(data){
        if(data['namesOn']){
            chrome.storage.local.clear(function(){
                chrome.storage.local.set({'namesOn' : false}, function(){
                    takeNamesOff();
                });
            });
        } else{
            chrome.storage.local.set({'namesOn' : true}, function(){
                putNamesOn();
            });
         }
    });
});

var takeNamesOff = function() {
    chrome.bookmarks.getTree(function(bookmarkTree) {
         var bookmarkBar = bookmarkTree[0]['children'][0];
         performForAllIn(bookmarkBar, takeNameOff);
    });
}

var putNamesOn = function() {
    chrome.bookmarks.getTree(function(bookmarkTree) {
         var bookmarkBar = bookmarkTree[0]['children'][0];
         performForAllIn(bookmarkBar, putNameOn);
    });
}

var performForAllIn = function(node, action) {
    if (node.hasOwnProperty('children')) {
        for (var i = 0; i < node['children'].length; i++) {
            var folder = node['children'][i];
            action(folder);
            performForAllIn(folder, action);
        }
    } else {
        action(node);
    }
}

var takeNameOff = function(node) {
    var original = {};
    original[node['id']] = node['title'];

    chrome.storage.local.set(original, function(){
        chrome.bookmarks.update(node.id, {'title' : ''});
    });
}

var putNameOn = function(node) {
    chrome.storage.local.get(null, function(data){
        var originalTitle = data[node.id];
        chrome.bookmarks.update(node.id, {'title' : originalTitle});
    });
}
