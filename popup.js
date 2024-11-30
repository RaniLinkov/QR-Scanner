document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('theme', savedTheme);
    updateIcons(savedTheme);
});

const darkModeButton = document.getElementById('dark-mode-button');

darkModeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
});

function updateIcons(theme) {
    const githubLinkIcon = document.querySelector('#github-link > img');
    const darkModeButtonIcon = document.querySelector('#dark-mode-button > img');
    const mainImageIcon = document.getElementById('main-image');

    if (theme === 'dark') {
        githubLinkIcon.src = '/icons/dark_mode/github-icon.png';
        darkModeButtonIcon.src = '/icons/dark_mode/dark-mode-icon.png';
        mainImageIcon.src = '/icons/dark_mode/qr-code-icon.png';
    } else {
        githubLinkIcon.src = '/icons/light_mode/github-icon.png';
        darkModeButtonIcon.src = '/icons/light_mode/dark-mode-icon.png';
        mainImageIcon.src = '/icons/light_mode/qr-code-icon.png';
    }
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

function handleError(error) {
    const content = document.getElementById('content');

    content.innerText = 'Error: ' + error;
}