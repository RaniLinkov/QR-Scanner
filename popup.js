document.addEventListener('DOMContentLoaded', async () => {
    const {QRCodeDataList} = await chrome.storage.local.get('QRCodeDataList');

    if (QRCodeDataList) {
        handleData(QRCodeDataList);
    } else {
        handleNoData();
    }
});

function handleData(data) {
    const content = document.getElementById('content');

    const dataListElement = createDataListElement(data);

    content.appendChild(dataListElement);
}

function createDataListElement(data) {
    const retVal = document.createElement('ul');

    for (const item of data) {
        const dataItemElement = createDataItemElement(item);
        retVal.appendChild(dataItemElement);
    }

    return retVal;
}

function createDataItemElement(data) {
    const retVal = document.createElement('li');

    retVal.innerText = JSON.stringify(data);

    return retVal;
}

function handleNoData() {
    const content = document.getElementById('content');

    content.innerText = 'No data found.';
}

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