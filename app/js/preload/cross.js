// cross.js
const Store = require('electron-store');
const cfg = new Store();

document.addEventListener('DOMContentLoaded', () => {
    // Fetch preferences data from Electron configuration store
    const xScale = cfg.get('xScale') || '70'; // If data doesn't exist, set default value to an empty string
    const yScale = cfg.get('yScale') || '70';
    const url = cfg.get('url') || 'https://cdn.discordapp.com/attachments/1220902614150156288/1222177544543928380/10_IQ_crosshair3.png?ex=66154489&is=6602cf89&hm=3efbaf4bcce448f934133a501b1ad09421c82657cb24d4feade2233210a1e866&';

    // Set input values with fetched data
    document.getElementById('xScale').value = xScale;
    document.getElementById('yScale').value = yScale;
    document.getElementById('url').value = url;

    const button = document.getElementById('cuisave');
    button.addEventListener('click', () => {
        savePrefs();
    });
});

function savePrefs() {
    const xScale = document.getElementById('xScale').value;
    const yScale = document.getElementById('yScale').value;
    const url = document.getElementById('url').value;

    // Save preferences data to the Electron configuration store
    cfg.set('xScale', xScale);
    cfg.set('yScale', yScale);
    cfg.set('url', url);

    window.close();
}
