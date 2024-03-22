const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const https = require('https');
const { app, remote, ipcRenderer } = require('electron');
const path = require('path');
const Toastify = require('toastify-js');
const Store = require('electron-store');
const store = new Store();

autoUpdater.setFeedURL({
    owner: 'itsNMD404',
    repo: 'EKC-Client',
    provider: 'github',
});
autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml');

const initAutoUpdater = async () => {
    autoUpdater.logger = log;

    autoUpdater.on('error', (err) => {
        console.error('Error in auto-updater:', err);
    });

    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info);
        store.set('updateVersion', info.version);
        autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-not-available', () => {
        console.log('No update available');
        store.set('updateVersion', 'null');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded');
        autoUpdater.quitAndInstall(true, true);
    });

    const latestVersion = await getLatestVersionFromGitHub();
    const currentVersion = app.getVersion();

    if (compareVersions(currentVersion, latestVersion) < 0) {
        console.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);
        autoUpdater.checkForUpdates();
    } 
    else {
        console.log('Current version is up to date');
    }
};

const getLatestVersionFromGitHub = async () => {
    const releasesURL = 'https://api.github.com/repos/itsNMD404/EKC-Client/releases/latest';
    const options = {
    headers: {
        'User-Agent': 'ekc-client' },
    };

    return new Promise((resolve, reject) => {
        https.get(releasesURL, options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData.tag_name.replace('v', ''));
                } 
                catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

const compareVersions = (versionA, versionB) => {
    const partsA = versionA.split('.');
    const partsB = versionB.split('.');
    for (let i = 0; i < partsA.length; i++) {
        const a = parseInt(partsA[i]);
        const b = parseInt(partsB[i]);
        if (a > b) return 1;
        if (a < b) return -1;
    }
    return 0;
};

module.exports = initAutoUpdater;
