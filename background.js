chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        chrome.tabs.captureVisibleTab(
            null,
            {format: 'png'},
            (dataUrl) => {
                sendResponse({imgSrc: dataUrl});
            }
        );

        return true;
    }
);