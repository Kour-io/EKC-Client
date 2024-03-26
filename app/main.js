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
  ['autoplay-policy', 'no-user-gesture-required', true],
  ['disable-frame-rate-limit', null, true],
  ['disable-gpu-vsync', null, true],
  ['max-gum-fps', '9999', true],
  ['enable-gpu-rasterization', null, true],
  ['enable-oop-rasterization', null, true],
  ['disable-zero-copy', null, true],
  ['enable-webgl2-compute-context', null, true],
  ['enable-highres-timer', null, true],
  ['enable-high-resolution-time', null, true],
  ['disable-renderer-backgrounding', null, true],
  ['disable-background-timer-throttling', null, true],
  ['enable-javascript-harmony', null, true],
  ['enable-future-v8-vm-features', null, true],
  ['enable-webgl', null, true],
  ['disable-2d-canvas-clip-aa', null, true],
  ['disable-bundled-ppapi-flash', null, true],
  ['disable-logging', null, true],
  ['disable-breakpad', null, true],
  ['disable-print-preview', null, true],
  ['disable-hang-monitor', null, true],
  ['disable-component-update', null, true],
  ['disable-metrics-repo', null, true],
  ['disable-metrics', null, true],
  ['max-active-webgl-contexts', '100', true],
  ['webrtc-max-cpu-consumption-percentage', '100', true],
  ['renderer-process-limit', '100', true],
  ['ignore-gpu-blacklist', null, true],
  ['enable-accelerated-2d-canvas', null, true],
  ['enable-quic', null, true],
  ['enable-native-gpu-memory-buffers', null, true],
  ['high-dpi-support', '1', true],
  ['no-pings', null, true],
  ['disable-low-end-device-mode', null, true],
  ['enable-accelerated-video-decode', null, true],
  ['no-proxy-server', null, true],
  ['disable-dev-shm-usage', null, true],
  ['use-angle', 'default', true],
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