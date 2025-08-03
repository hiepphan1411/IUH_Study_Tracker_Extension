chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_CURRICULUM_TAB") {
    chrome.tabs.create(
      {
        url: "https://sv.iuh.edu.vn" + message.url + "?auto=true",
        active: false,
        pinned: true,
      },
      (newTab) => {
        if (chrome.runtime.lastError) {
          console.log("Lỗi tạo tab:", chrome.runtime.lastError);
        } else {
          console.log("Đã tạo tab ghim:", newTab.id);
        }
        sendResponse({ success: true });
      }
    );
    return true;
  }

  if (message.type === "CURRICULUM_SAVED") {
    if (message.closeTab && sender.tab) {
      setTimeout(() => {
        chrome.tabs.remove(sender.tab.id, () => {
          if (chrome.runtime.lastError) {
            console.log("Lỗi đóng tab:", chrome.runtime.lastError);
          }
        });
      }, 2000);
    }
    sendResponse({ success: true });
  }

  if (message.type === "SCHEDULE_SAVED") {
    sendResponse({ success: true });
  }

  if (message.type === "AUTO_CLOSE_TAB") {
    const { tabId, timeout } = message;
    setTimeout(() => {
      chrome.tabs.remove(tabId, () => {
      });
    }, timeout);
  }
});
