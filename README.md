This is a reproduction case for a bug in the [chrome.tabGroups.move()](https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-move) API method.

### Description of the bug:

When trying to move one tab-group right next to another tab-group,
you might get the following exception message in the extension console log:

```
Uncaught (in promise) Error: Cannot move the group to an index that is in the middle of another group.
```

While for certain cases this error would make absolute sense,
in the particular scenario that is reproduced in the `background.js` code,
this error should NOT be thrown and the group should be moved successfully instead.

⚠️ See the comments in the [background.js](background.js) file for the details about the bug.

---

### To reproduce the bug:

1. Load this folder as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) into Chrome
2. [Pin the extension icon](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#pin), so you can easily click it to run the test-case
3. Open a new (second) window in your Chrome browser
4. ⚠️Make sure that only **one single tab is open** in the Chrome window before you run the test-case
5. 🖱️ Click the pinned `c` extension button in the top-right corner of your Chrome browser
6. 🐞Check the [extension error logs](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#errors) to see the produced exception message

---

### Chrome version / OS version:

```
Chrome Version: Version 111.0.5563.33 (Official Build) beta (64-bit)
Running on Windows 10 (Version 22H2, Build 19045.2604)
```
