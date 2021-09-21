
chrome.runtime.onInstalled.addListener(function () {
    console.log('started')
chrome.tabs.create({ url: 'index.html'});
})