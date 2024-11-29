//TODO: remove, this is just for testing
function handleError(error) {
    const content = document.getElementById('content');

    content.innerText = 'Error: ' + error;
}

const scanButton = document.getElementById('scan-button');

scanButton.addEventListener('click', async () => {
    await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const [tab] = tabs;

        if (tab.url?.startsWith('chrome://')) return undefined;

        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: ['content.js'],
        }).then(() => {
            window.close();
        }).catch((error) => {
            handleError(error);
        });
    });
});