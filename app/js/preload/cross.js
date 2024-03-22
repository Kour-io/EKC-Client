// cross.js

const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const cfg = new Store();

document.addEventListener('DOMContentLoaded', () => {
    // Fetch preferences data from Electron configuration store
    const xScale = cfg.get('xScale') || ''; // If data doesn't exist, set default value to an empty string
    const yScale = cfg.get('yScale') || '';
    const url = cfg.get('url') || '';

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

    // Send IPC message to the main process to notify about the save operation
    ipcRenderer.send('prefsSaved');
    window.close();
}
