document.getElementById('openTab').onclick = () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('main.html') });
}; 