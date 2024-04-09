const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const https = require('https');
const { app } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml');

const initAutoUpdater = async () => {
    autoUpdater.logger = log;
    store.set('updatePercent', null);
    autoUpdater.on('error', (err) => {
        log.info('Error in auto-updater:', err);
    });

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
        store.set('updateAvailable', 'checking');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info);
        store.set('updateVersion', info.version);
        store.set('updateAvailable', true);
        store.set('updatePercent', 0); // Initialize progress to 0%
        autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-not-available', () => {
        console.log('No update available');
        store.set('updateVersion', null);
        store.set('updatePercent', null);
        store.set('updateData', null); // Reset progress
        store.set('updateAvailable', false);
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded');
        store.set('updatePercent', null); // Reset progress
        store.set('updateData', null); // Reset progress
        autoUpdater.quitAndInstall(true, false);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        const { percent } = progressObj;
        store.set('updatePercent', percent);
        store.set('updateData', progressObj);
    });

    const latestVersion = await getLatestVersionFromGitHub();
    const currentVersion = app.getVersion();

    if (compareVersions(currentVersion, latestVersion) < 0) {
        console.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);
        autoUpdater.checkForUpdates();
    } 
    else {
        store.set('updateAvailable', 'upToDate');
    }
};

const getLatestVersionFromGitHub = async () => {
    const releasesURL = 'https://api.github.com/repos/Kour-io/EKC-Client/releases/latest';
    const options = {
        headers: {
            'User-Agent': 'ekc-client',
        },
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
