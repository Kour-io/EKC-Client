const { app, BrowserWindow } = require('electron');


let client = new (require('discord-rpc-revamp').Client)();


client.connect({ clientId: '1218201961296564297' }).catch(console.error);



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


  client.on('ready', _ => {
    client.setActivity({
      details: 'EKC-Client',
      largeImageKey: 'kour',
      startTimestamp: Date.now()
    }).then(_ => {
      console.log('rpc set');
    });

    client.subscribe('ACTIVITY_JOIN');
    client.subscribe('ACTIVITY_JOIN_REQUEST');

    client.on('ACTIVITY_JOIN', data => {});
  });
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
