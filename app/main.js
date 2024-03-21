const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const platformType = require('os').platform();
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const gwnd = require('./js/utils/gameWindow.js');
const autoUpdater = require('./js/utils/autoUpdater.js');
Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  },
});
const url = 'https://kour.io';
const chromiumFlags = [
  ['disable-frame-rate-limit'],
  ['disable-gpu-vsync'],
  ['use-angle', 'default'],
  ['enable-webgl2-compute-context'],
  ['in-process-gpu', null, platformType === 'win32'],
  ['autoplay-policy', 'no-user-gesture-required'],
  ['disable-features', 'NetworkService=1'],
];


app.whenReady().then(() => {
  chromiumFlags.forEach(flag => {
    const [flagName, flagValue, condition] = flag;
    if (condition !== false) {
      app.commandLine.appendSwitch(flagName, flagValue);
    }
  });
  gwnd.launchGame(url); 
  autoUpdater();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

