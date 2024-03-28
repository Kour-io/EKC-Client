const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const platformType = require('os').platform();
const log = require('electron-log');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const gwnd = require('./js/utils/gameWindow.js');
const initAutoUpdater = require('./js/utils/autoUpdater.js');
const os = require('os');
const { eventNames } = require('process');
Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  },
});

const documentsPath = app.getPath('documents');
const ekcUtilsFolderPath = path.join(documentsPath, 'EKC-Utils');

fs.mkdirSync(ekcUtilsFolderPath, { recursive: true });

const url = 'https://kour.io';
const chromiumFlags = [
  ['disable-frame-rate-limit', null, true],
  ['disable-gpu-vsync', null, true],
  ['enable-gpu-rasterization', null, true],
  ['enable-oop-rasterization', null, true],
  ['enable-webgl2-compute-context', null, true],
  ['enable-highres-timer', null, true],
  ['disable-background-timer-throttling', null, true],
  ['enable-future-v8-vm-features', null, true],
  ['enable-webgl', null, true],
  ['renderer-process-limit', '100', true],
  ['enable-accelerated-2d-canvas', null, true],
  ['enable-native-gpu-memory-buffers', null, true],
  ['high-dpi-support', '1', true],
  ['ignore-gpu-blacklist', null, true],
  ['enable-accelerated-video-decode', null, true],
];


app.whenReady().then(() => {
  chromiumFlags.forEach(flag => {
    const [flagName, flagValue, condition] = flag;
    if (condition !== false) {
      app.commandLine.appendSwitch(flagName, flagValue);
    }
  });
  gwnd.startLauncher();
  if (os.platform() != 'darwin') {
    initAutoUpdater();
}
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('testInvoke', () => {
  
});

ipcMain.handle('exitLauncher', (event, ...args) => {
  gwnd.closeLauncher();
  app.quit();
});

ipcMain.handle('startGame', (event, ...args) => {
  gwnd.launchGame(url);
  gwnd.closeLauncher();
  if (os.platform() != 'darwin') {
    initAutoUpdater();
} 
});