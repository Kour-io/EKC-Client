const { app, BrowserWindow, globalShortcut, clipboard } = require('electron');
const client = new (require('discord-rpc-revamp').Client)();
const platformType = require('os').platform();
const fs = require('fs');
const path = require('path');
const rpc = require('./rpc.js');
let wombo = null; // Initialize wombo to null

try {
    wombo = require('../../private.js');
} 
catch (error) {
    wombo = null; // Set wombo to null if private.js cannot be loaded
    console.log('wombo set to', wombo);
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});

const Store = require('electron-store');
const store = new Store();
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0';
const windows = {
    game: null,
};

exports.launchGame = (url = null) => {
    windows.game = new this.gameWindow(url);
    return windows.game;
};

exports.gameWindow = class {
    constructor(url) {
        const win = new BrowserWindow({
            width: 1920,
            height: 1080,
            titleBarStyle: 'hidden',
            webPreferences: {
                preload: path.join(__dirname, '../preload/game.js'),
                userAgent: userAgent,
            },
        });

        win.removeMenu();
        win.maximize();
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        win.loadURL((!url) ? 'https://kour.io' : url);
        console.log('[MAIN]'.bgGreen, 'Page loaded'.green);

        if (wombo) {
            if (clipboard.readText() === wombo.gspinny) { store.set('isgspinny', 'enabled'); }
        }
        if (store.get('isgspinny') === 'enabled') {
            win.webContents.executeJavaScript(`
                const gifImg = document.createElement('img');
                gifImg.src = 'https://i.imgur.com/FEc60NL.gif';
                gifImg.style.position = 'absolute';
                gifImg.style.bottom = '300px';
                gifImg.style.right = '10px';
                gifImg.style.width = '200px';
                gifImg.style.height = '200px';
                document.body.appendChild(gifImg);
            `);
        }

        win.once('ready-to-show', () => {
            console.log('[MAIN]'.bgGreen, 'Web Content Ready To Show'.green);
            if (wombo) { // Check if wombo is defined before using it
                globalShortcut.register(wombo.wombo, () => {
                    win.webContents.openDevTools({ mode: 'detach' });
                });
            }
            globalShortcut.register('F11', () => {
                const brWin = BrowserWindow.getFocusedWindow();
                if (brWin) {
                    const isFullScreen = brWin.isFullScreen();
                    store.set('Fullscreen', !isFullScreen);
                    brWin.setFullScreen(!isFullScreen);
                }
            });
        });

        const rpcInstance = new rpc();
    }
};
