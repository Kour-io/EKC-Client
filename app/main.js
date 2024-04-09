const { app, ipcMain } = require('electron');
const Store = require('electron-store');
const store = new Store();
const platformType = require('os').platform();
const log = require('electron-log');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const gwnd = require('./js/utils/gameWindow.js');
const initAutoUpdater = require('./js/utils/autoUpdater.js');
const os = require('os');

const documentsPath = app.getPath('documents');
const ekcUtilsFolderPath = path.join(documentsPath, 'EKC-Utils');

fs.mkdirSync(ekcUtilsFolderPath, { recursive: true });

const url = 'https://kour.io';

const flags = [
  ['disable-frame-rate-limit', null, true],
  ['disable-gpu-vsync', null, true],
  ['enable-webgl2-compute-context', null, true],
  ['disable-accelerated-2d-canvas', 'true', true],
  ['autoplay-policy', 'no-user-gesture-required', true],
  ['disable-features', 'NetworkService=1', true],
  ['enable-webgl', null, true],
  ['enable-highres-timer', null, true],
  ['disable-background-timer-throttling', null, true],
  ['enable-javascript-harmony', null, true],
  ['enable-future-v8-vm-features', null, true],
  ['disable-renderer-backgrounding', null, true],
  ['enable-gpu-rasterization', null, true],
  ['enable-oop-rasterization', null, true],
  ['disable-zero-copy', null, true],
  ['in-process-gpu', null, platformType === 'win32'],
  ['autoplay-policy', 'no-user-gesture-required', true],
  ['disable-frame-rate-limit', null, true],
  ['disable-gpu-vsync', null, true],
  ['max-gum-fps', '9999', true],
  ['max-active-webgl-contexts', '100', true],
  ['webrtc-max-cpu-consumption-percentage', '100', true],
  ['renderer-process-limit', '100', true],
  ['ignore-gpu-blacklist', null, true],
  ['enable-accelerated-2d-canvas', null, true],
  ['enable-quic', null, true], // (WARNING?)
  ['enable-native-gpu-memory-buffers', null, true],
  ['high-dpi-support', '1', true],
  ['no-pings', null, false],
  ['disable-low-end-device-mode', null, true],
  ['enable-accelerated-video-decode', null, true],
  ['no-proxy-server', null, true],
];


flags.forEach(flag => {
  const [flagName, flagValue, condition] = flag;
  if (condition !== false) {
    if (flagValue !== null) {
      app.commandLine.appendSwitch(flagName, flagValue);
    }
    else {
      app.commandLine.appendSwitch(flagName);
    }
    log.info(flagName, flagValue !== null ? flagValue : condition);
  }
});

app.whenReady().then(() => {
  store.set('osplatform', os.platform());
  gwnd.startLauncher();
  if (os.platform() === 'win32') {
    initAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.handle('exitLauncher', () => {
  gwnd.closeLauncher();
  app.quit();
});

ipcMain.handle('startGame', () => {
  gwnd.launchGame(url);
  gwnd.closeLauncher();
});