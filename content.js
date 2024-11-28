console.debug('Content script loaded');

(() => {
    console.debug('Content script executed');

    //region Constants
    const QR_SCANNER_OVERLAY_ID = 'qr-scanner-overlay';
    const QR_SCANNER_SELECTION_BOX_ID = 'qr-scanner-selection-box';

    //endregion

    //region Variables
    let overlayElement = null;
    let selectionBoxElement = null;
    let startX = null;
    let startY = null;
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
        retVal.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        retVal.style.cursor = "crosshair";

        return retVal;
    }

    function destroyOverlay() {
        if (overlayElement) {
            overlayElement.remove();
            overlayElement = null;
        }
    }

    function createSelectionBox() {
        const retVal = document.createElement('div');
        retVal.id = QR_SCANNER_SELECTION_BOX_ID;

        retVal.style.position = 'absolute';
        retVal.style.border = "1.5px dashed #080341";
        retVal.style.pointerEvents = "none";
        retVal.style.left = `${startX}px`;
        retVal.style.top = `${startY}px`;

        return retVal;
    }

    function updateSelectionBox(currentX, currentY) {
        selectionBoxElement.style.left = `${Math.min(startX, currentX)}px`;
        selectionBoxElement.style.top = `${Math.min(startY, currentY)}px`;
        selectionBoxElement.style.width = `${Math.abs(currentX - startX)}px`;
        selectionBoxElement.style.height = `${Math.abs(currentY - startY)}px`;
    }

    function onMouseDown(event) {
        if (event.button !== 0) return;

        startX = event.clientX;
        startY = event.clientY;

        selectionBoxElement = createSelectionBox();
        overlayElement.appendChild(selectionBoxElement);

        overlayElement.addEventListener('mousemove', onMouseMove);
        overlayElement.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        updateSelectionBox(event.clientX, event.clientY);
    }

    function onMouseUp() {
        destroyOverlay();
    }

    //endregion

    destroyOverlay();

    window.addEventListener('blur', destroyOverlay);

    overlayElement = createOverlay();

    document.body.appendChild(overlayElement);

    overlayElement.addEventListener('mousedown', onMouseDown);
})();
