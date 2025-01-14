
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: 'options.html' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) { 
    console.log(`URL of tab ${tabId} has changed to: ${changeInfo.url}`);
    chrome.tabs.sendMessage(tabId, {
      type: 'URL_CHANGED',
      url: changeInfo.url
    });
  }
});
