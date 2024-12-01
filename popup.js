const THEME = 'theme';
const LIGHT = 'light';
const DARK = 'dark';
const ICONS_LIGHT_MODE_PATH = '/icons/light_mode/';
const ICONS_DARK_MODE_PATH = '/icons/dark_mode/';
const GIT_HUB_ICON = 'github-icon.png';
const DARK_MODE_ICON = 'dark-mode-icon.png';
const QR_CODE_ICON = 'qr-code-icon.png';

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME) || LIGHT;
    document.documentElement.setAttribute(THEME, savedTheme);
    updateIcons(savedTheme);
});

document.getElementById('dark-mode-button').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute(THEME);
    const newTheme = currentTheme === DARK ? LIGHT : DARK;
    document.documentElement.setAttribute(THEME, newTheme);
    localStorage.setItem(THEME, newTheme);
    updateIcons(newTheme);
});

function updateIcons(theme) {
    const githubLinkIcon = document.querySelector('#github-link > img');
    const darkModeButtonIcon = document.querySelector('#dark-mode-button > img');
    const mainImageIcon = document.getElementById('main-image');

    if (theme === DARK) {
        githubLinkIcon.src = `${ICONS_DARK_MODE_PATH}${GIT_HUB_ICON}`;
        darkModeButtonIcon.src = `${ICONS_DARK_MODE_PATH}${DARK_MODE_ICON}`;
        mainImageIcon.src = `${ICONS_DARK_MODE_PATH}${QR_CODE_ICON}`;
    } else {
        githubLinkIcon.src = `${ICONS_LIGHT_MODE_PATH}${GIT_HUB_ICON}`;
        darkModeButtonIcon.src = `${ICONS_LIGHT_MODE_PATH}${DARK_MODE_ICON}`;
        mainImageIcon.src = `${ICONS_LIGHT_MODE_PATH}${QR_CODE_ICON}`;
    }
}

document.getElementById('scan-button').addEventListener('click', async () => {
    await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const [tab] = tabs;

        if (tab.url?.startsWith('chrome://')) return undefined;

        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: ['content.js'],
        }).catch((error) => {
            console.log(error);
        }).finally(() => window.close());
    });
});