(() => {
    //region Constants
    const QR_SCANNER_OVERLAY_ID = 'qr-scanner-overlay';
    const QR_SCANNER_SELECTION_BOX_ID = 'qr-scanner-selection-box';
    const DATA_START_X_ATTRIBUTE = 'data-start-x';
    const DATA_START_Y_ATTRIBUTE = 'data-start-y';

    //endregion

    //region Variables
    let overlayElement = document.getElementById(QR_SCANNER_OVERLAY_ID);
    let selectionBoxElement = null;
    //endregion

    //region Functions
    function createOverlay() {
        const retVal = document.createElement('div');
        retVal.id = QR_SCANNER_OVERLAY_ID;

        retVal.style.position = 'fixed';
        retVal.style.top = '0';
        retVal.style.left = '0';
        retVal.style.width = '100%';
        retVal.style.height = '100%';
        retVal.style.zIndex = '2000000000';
        retVal.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        retVal.style.cursor = 'crosshair';

        return retVal;
    }

    function destroyOverlay() {
        if (overlayElement) {
            overlayElement.remove();
            overlayElement = null;
        }
    }

    function createSelectionBox(startX, startY) {
        const retVal = document.createElement('div');
        retVal.id = QR_SCANNER_SELECTION_BOX_ID;

        retVal.style.position = 'absolute';
        retVal.style.border = '1.5px dashed #080341';
        retVal.style.pointerEvents = 'none';
        retVal.style.left = `${startX}px`;
        retVal.style.top = `${startY}px`;
        retVal.setAttribute(DATA_START_X_ATTRIBUTE, startX);
        retVal.setAttribute(DATA_START_Y_ATTRIBUTE, startY);

        return retVal;
    }

    function updateSelectionBox(currentX, currentY) {
        const startX = parseInt(selectionBoxElement.getAttribute(DATA_START_X_ATTRIBUTE));
        const startY = parseInt(selectionBoxElement.getAttribute(DATA_START_Y_ATTRIBUTE));

        selectionBoxElement.style.left = `${Math.min(startX, currentX)}px`;
        selectionBoxElement.style.top = `${Math.min(startY, currentY)}px`;
        selectionBoxElement.style.width = `${Math.abs(currentX - startX)}px`;
        selectionBoxElement.style.height = `${Math.abs(currentY - startY)}px`;
    }

    function onMouseDown(event) {
        if (event.button !== 0) return;

        event.preventDefault();

        selectionBoxElement = createSelectionBox(event.clientX, event.clientY);
        overlayElement.appendChild(selectionBoxElement);

        overlayElement.addEventListener('mousemove', onMouseMove);
        overlayElement.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        updateSelectionBox(event.clientX, event.clientY);
    }

    function onMouseUp() {
        const adjustedSelectionBox = createAdjustedSelectionBox(selectionBoxElement);

        destroyOverlay();

        window.removeEventListener('blur', destroyOverlay);
        window.removeEventListener('keydown', destroyOverlay);

        if (adjustedSelectionBox.width > 0 && adjustedSelectionBox.height > 0) {
            chrome.runtime.sendMessage({action: 'capture'}, async (response) => {
                const image = await loadImage(response.dataUrl);
                const croppedImageData = await getCroppedImageData(image, adjustedSelectionBox);

                const QRCodeData = scanQRCode(croppedImageData);

                if (isLink(QRCodeData)) {
                    console.log('Link:', QRCodeData);
                    window.open(QRCodeData, '_blank');
                } else {
                    console.log('Data:', QRCodeData);
                }
            });
        }

        //crop image
    }

    //endregion

    destroyOverlay();

    window.addEventListener('blur', destroyOverlay);

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            destroyOverlay();
        }
    });

    overlayElement = createOverlay();

    document.body.appendChild(overlayElement);

    overlayElement.addEventListener('mousedown', onMouseDown);
})();

function createAdjustedSelectionBox(selectionBoxElement) {
    const dpr = window.devicePixelRatio || 1;

    return {
        left: (parseInt(selectionBoxElement.style.left, 10) + window.scrollX) * dpr,
        top: (parseInt(selectionBoxElement.style.top, 10) + window.scrollY) * dpr,
        width: parseInt(selectionBoxElement.style.width, 10) * dpr,
        height: parseInt(selectionBoxElement.style.height, 10) * dpr,
    };
}

function scanQRCode(imageData) {
    console.log('Scanning QR code...');

    const result = jsQR(imageData.data, imageData.width, imageData.height);

    return result?.data;
}

async function getCroppedImageData(image, selectionBox) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = selectionBox.width;
    canvas.height = selectionBox.height;

    context.drawImage(
        image,
        selectionBox.left,
        selectionBox.top,
        selectionBox.width,
        selectionBox.height,
        0,
        0,
        selectionBox.width,
        selectionBox.height
    );

    return context.getImageData(0, 0, selectionBox.width, selectionBox.height);
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });
}

function isLink(data) {
    const urlPattern = /^(https?:\/\/)([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/\w\.-])\/?$/;
    return urlPattern.test(data);
}
