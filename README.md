# unique-tabid

This package helps you maintain Unique IDs per tab by taking care of differentiating duplicated tabs/sessions as well. This package can also be leveraged to let you know if a newly loaded tab was duplicated or not, and also get the TabId of the parent tab (the tab from which this was duplicated)

## What browser APIs we use
We make use of the following
- [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is a Key-Value browser storage that is maintained per tab, per URL. But the only catch here is that when the tab is duplicated, the SessionStorage of the old tab is copied over to the new tab.
- [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) is an event/event-listener based communication system between tabs of the same URL.

## How this works
As soon as a tab is loaded/refreshed, we first check if the SessionStorage contains a TabId.
- If we do not have a TabID already, we create a fresh one, and store it in SessionStorage.
- If we have a TabID already, it means that either we have refreshed the same tab (which means we should retain the TabID), or that we have loaded the duplicated tab, with the TabID of the older tab inherited (which means we have to generate a new TabID).

So whenever a page is loaded/refreshed, we look into SessionStorage and if it returns a valid TabID, we use BroadcastChannel to send a "SEARCH" message to all other tabs, and they would respond with a "FOUND" message if they have the same TabID; None of the tabs would respond if they do not have the TabID we are looking for.


## The Catch
So in this second scenario where a new tab was loaded without duplication, we would not receive any response from the other tabs... So how long to wait till we assume that no duplication has occured...? For now we have kept this as a property that you can configure, with the default set at 1 second.

This means that when we use a debugger and pause execution at the right (or wrong) time, we could mess up this operation.

## How to use
The default export is a class. Instantiate the class and set the appropriate properties.

```console
npm install --save unique-tabid
```

```js
// Import
import UniqueTabId from "unique-tabid";

// Instantiate the class and pass some string that identifies your app
const uniqueTabId = new UniqueTabId("testapp");

// Set properties

// Override the wait time for communication
uniqueTabId.WAIT_TIMEOUT = 2000;

// Mandatory: a function that is to be called to generate a unique TabID.
// In this example, I have used the famous uniqid package from NPM
uniqueTabId.uniqIdFunc = uniqid;

// This is the callback that is called when we have the tabId ready, after all the communications
uniqueTabId.tabIdCallback = ({tabId, isNewTab, parentTabId}) => {}
// If used in React, you can call a State Change like shown in the functional React example below.
const [text, setText] = useState("");
uniqueTabId.tabIdCallback = ({tabId, isNewTab, parentTabId}) => setText(`TabId: ${tabId}; New Tab: ${isNewTab}; Duplicated: ${parentTabId !== null ? `Yes. ParentTabId = ${parentTabId}` : "No"}`);

// IMPORTANT: You need to absolutely call the following method at every tab initialization. This is the main process.
uniqueTabId.initTab()
// If used in React, you can call this in the componentDidMount or like in the following functional React equivalent.
useEffect(() => uniqueTabId.initTab(), []);
```

You can also have a look at the example React App at https://github.com/haricane8133/unique-tabid-client. This was created using create-react-app. Have a look at the changes from the second commit.

## Thoughts
I couldn't take part in #hacktoberfest2022. So would this package make it up instead?

It would be awesome to have contributions coming in to remove 'The Catch' mentioned above.