const { app, BrowserWindow, globalShortcut, clipboard } = require('electron');
const client = new (require('discord-rpc-revamp').Client)();
const platformType = require('os').platform();
const path = require('node:path');
const rpc = require('./rpc.js');
const wombo = require('../../private.js');

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
            },
        });
        
            win.removeMenu();
            win.maximize();
            win.once('focus', () => win.flashFrame(false));
            win.flashFrame(true);
            win.loadURL((!url) ? 'https://kour.io' : url);
            console.log('[MAIN]'.bgGreen, 'Page loaded'.green);
        
        win.once('ready-to-show', () => {
            console.log('[MAIN]'.bgGreen, 'Web Content Ready To Show'.green);
            globalShortcut.register(wombo.wombo, () => {
                win.webContents.openDevTools({ mode: 'detach' });
            });
        });
        const rpcInstance = new rpc();
        
    }
};

