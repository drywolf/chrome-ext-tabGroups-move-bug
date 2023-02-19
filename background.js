/*
//---------------------------------------------------------------------------------

Chrome Version: Version 111.0.5563.33 (Official Build) beta (64-bit)

Use-case:
    Want to move one tab-group to be put right after the last tab of another tab-group, by using the `chrome.tabGroups.move()` API.

Expected behavior:

Tabs before `move(red_group, { index: 3 })`:
    [chrome://extensions/] [RED_1 + RED_2] [GREEN_3 + GREEN_4] [NO_GROUP_5]

Tabs after the `move()` call:
    [chrome://extensions/] [GREEN_3 + GREEN_4] [RED_1 + RED_2] [NO_GROUP_5]

//---------------------------------------------------------------------------------

# ISSUE / BUG:

The function call `await chrome.tabGroups.move(red_group, { index: 3 });`
produces the following error message in the extension's service worker log:

    `Uncaught (in promise) Error: Cannot move the group to an index that is in the middle of another group.`

But it should have moved the `red_group` to be immediately right next to the `green_group`.

//---------------------------------------------------------------------------------

I also tried calling `move()` with `index: 4`, but this does not really lead to an expected result either:

Tabs before `move(red_group, { index: 4 })`:
    [chrome://extensions/] [RED_1 + RED_2] [GREEN_3 + GREEN_4] [NO_GROUP_5]

Tabs after the `move()` call:
    [chrome://extensions/] [GREEN_3 + GREEN_4] [NO_GROUP_5] [RED_1 + RED_2]

Somehow the API decided to move the `red_group` after the `NO_GROUP_5` tab.
I would have rather expected to get the same error message as above,
since `index: 4` is the `GREEN_4` tab that is part of a group, so when trying to
move another group to this position actually the error would have made sense.

//---------------------------------------------------------------------------------
*/

chrome.action.onClicked.addListener(async function () {
    // 'chrome://extensions/' tab is already open at index: 0
    // (and should be the only tab open in this window before running this test !!!)
    const red1 = await chrome.tabs.create({ url: "https://google.com#__RED_1__" });             // create new tab at index: 1
    const red2 = await chrome.tabs.create({ url: "https://google.com#__RED_2__" });             // create new tab at index: 2
    const green3 = await chrome.tabs.create({ url: "https://google.com#__GREEN_3__" });         // create new tab at index: 3
    const green4 = await chrome.tabs.create({ url: "https://google.com#__GREEN_4__" });         // create new tab at index: 4
    const no_group5 = await chrome.tabs.create({ url: "https://google.com#__NO_GROUP_5__" });   // create new tab at index: 5

    const red_group = await chrome.tabs.group({ tabIds: [red1.id, red2.id] });          // create the "red" group
    const green_group = await chrome.tabs.group({ tabIds: [green3.id, green4.id] });    // create the "green" group

    await chrome.tabGroups.update(red_group, { color: 'red' });         // color the first group red
    await chrome.tabGroups.update(green_group, { color: 'green' });     // color the second group green

    // wait a bit for the pages to be loaded (otherwise we won't see the urls in the upcoming console.logs)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tabs before move:
    //      [chrome://extensions/] [RED_1 + RED_2] [GREEN_3 + GREEN_4] [NO_GROUP_5]
    //
    // Tabs after move SHOULD BE:
    //      [chrome://extensions/] [GREEN_3 + GREEN_4] [RED_1 + RED_2] [NO_GROUP_5]

    const tabs_before = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    console.log("tabs BEFORE move", tabs_before.map(t => ({ index: t.index, id: t.id, url: t.url }))); // log all tabs before the move (for debugging)

    // THIS IS THE CALL THAT BEHAVES INCORRECTLY !
    // (see ISSUE description above)
    await chrome.tabGroups.move(red_group, { index: 3 }); // `Uncaught (in promise) Error: Cannot move the group to an index that is in the middle of another group.`

    const tabs_after = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    console.log("tabs AFTER move", tabs_after.map(t => ({ index: t.index, id: t.id, url: t.url }))); // log all tabs after the move (for debugging)
});
