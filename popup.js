document.addEventListener('DOMContentLoaded', async () => {
    const {QRCodeDataList} = await chrome.storage.local.get('QRCodeDataList');

    if (QRCodeDataList) {
        handleData(QRCodeDataList);
    } else {
        handleNoData();
    }
});

function handleData(dataList) {
    const content = document.getElementById('content');

    const dataListElement = createDataListElement(dataList);

    content.appendChild(dataListElement);
}

function createDataListElement(dataList) {
    const retVal = document.createElement('ul');

    for (const itemItem of dataList) {
        const dataItemElement = createDataItemElement(itemItem);
        retVal.appendChild(dataItemElement);
    }

    return retVal;
}

function createDataItemElement(dataItem) {
    const retVal = document.createElement('li');

    const dataElement = document.createElement("span");
    dataElement.innerText = dataItem.data;
    dataElement.classList.add('data');

    const timestampElement = document.createElement("span");
    timestampElement.innerText = dataItem.timestamp;
    timestampElement.classList.add('timestamp');

    retVal.appendChild(dataElement);
    retVal.appendChild(timestampElement);

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