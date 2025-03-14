Just Icons on the Bookmarks Bar in Chrome
----------------------------------------

Install from Chrome Web Store: https://chrome.google.com/webstore/detail/just-icons/cebjhochebphokcpenikgbljlbmlhefm

**Click to hide titles of your bookmarks. Click again to restore them.**

In Options, you can tune hiding scope:

![](options.png)

IMPORTANT: Restore the bookmarks titles before uninstalling the extension. Otherwise, the
titles will be lost.

It's because Chrome doesn't allow the extension to detect its own removal and therefore the extension cannot handle titles restoration automatically.
As a safety measure it's best to back up bookmarks before the very first use of the extension - howto: https://support.google.com/chrome/answer/96816?hl=en

Feel free to ask questions.

Enjoy your new aesthetic bookmarks bar!

## Development
```shell
npm run prepare-dependencies
npm run web-ext:chromium-test
```

### Build

1. Update version in `manifest.json`
1. `(cd src && zip -r ../just-icons.zip .)`
