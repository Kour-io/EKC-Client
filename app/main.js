const { app, BrowserWindow } = require('electron');
const url = 'https://kour.io';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    titleBarStyle: 'hidden',
  });
    win.removeMenu();
    win.maximize();
    win.once('focus', () => win.flashFrame(false));
  win.flashFrame(true);
    win.loadURL(url);
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});