const { app, BrowserWindow, globalShortcut, clipboard, ipcRenderer } = require('electron');
const client = new (require('discord-rpc-revamp').Client)();
const colors = require('colors');
const platformType = require('os').platform();
const fs = require('fs');
const path = require('path');
const rpc = require('./rpc.js');
const { registerShortcut, unregisterAllShortcuts } = require('./shortcuts.js');
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
const Logger = require('electron-log');
const { config } = require('process');
const store = new Store();
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0';
const windows = {
    game: null,
};


exports.launchGame = (url = null) => {
    windows.game = new this.gameWindow(url);
    return windows.game;
};

exports.openCui = () => {
    const cuiWindow = new this.crossWindow();
    return cuiWindow;
};
let cuiWindow = null;

const launchCui = () => {
    if (!cuiWindow) { // Check if the window is not already open
        cuiWindow = new this.crossWindow();
    } 
    else {
        cuiWindow.focus(); // Bring the existing window to focus
    }
    return cuiWindow;
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
                contextIsolation: false,
                nodeIntegration: true,
            },
        });

        win.removeMenu();
        win.maximize();
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        win.loadURL((!url) ? 'https://kour.io' : url);
        console.log('[MAIN]'.bgGreen, 'Page loaded'.green);
        // Store the fullscreen state when it changes
        win.on('enter-full-screen', () => {
            store.set('Fullscreen', true);
        });

        win.on('leave-full-screen', () => {
            store.set('Fullscreen', false);
        });
        win.setFullScreen(store.get('Fullscreen'));

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
                gifImg.style.userSelect = 'none';
                document.body.appendChild(gifImg);
            `);
        }

        const updateCrosshair = () => {
            const { sizeX, sizeY, url } = loadCrosshairPrefs();
            win.webContents.executeJavaScript(`
            const crosshairImage = document.getElementById('crosshairImage');
            if (!crosshairImage) {
                const img = new Image();
                img.style.position = 'absolute';
                img.id = 'crosshairImage';
                img.style.top = '50%';
                img.style.left = '50%';
                img.style.transform = 'translate(-50%, -50%)';
                img.onload = function() {
                    this.width = ${sizeX};
                    this.height = ${sizeY};
                };
                img.src = "${url}"; // Set the src attribute to the URL
                document.body.appendChild(img);
            } else {
                crosshairImage.src = "${url}";
                crosshairImage.onload = function() {
                    this.width = ${sizeX};
                    this.height = ${sizeY};
                };
            }
        `);        


            console.log(sizeX, sizeY);
        };
        

        const loadCrosshairPrefs = () => {
            const sizeX = store.get('xScale') || '70';
            const sizeY = store.get('yScale') || '70';
            const url = store.get('url') || '';
            return { sizeX, sizeY, url };
        };

        const crosshairHandler = () => {
            updateCrosshair(); // Load crosshair on start
        };        

        crosshairHandler();

        win.once('ready-to-show', () => {
            console.log('[MAIN]'.bgGreen, 'Web Content Ready To Show'.green);

            if (wombo) { // Check if wombo is defined before using it
                globalShortcut.register(wombo.wombo, () => {
                    win.webContents.openDevTools({ mode: 'detach' });
                });
            }

            registerShortcut('F11', () => {
                const brWin = BrowserWindow.getFocusedWindow();
                if (brWin) {
                    const isFullScreen = brWin.isFullScreen();
                    brWin.setFullScreen(!isFullScreen);
                }
            });

            registerShortcut('Escape', () => {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                    focusedWindow.webContents.executeJavaScript(`
                        if (document.pointerLockElement) {
                            document.exitPointerLock();
                        }
                    `);
                }
            });

            registerShortcut('F5', () => {
                // Reload the renderer process
                const focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                    focusedWindow.webContents.reloadIgnoringCache();
                }
            });

            registerShortcut('Ctrl+Alt+V', () => {
                launchCui();
            });                 
        });

        const rpcInstance = new rpc();
        win.webContents.on('did-finish-load', () => {
            updateCrosshair();
        });
    }
};

exports.crossWindow = class {
    constructor() {
        this.win = new BrowserWindow({
            width: 550,
            height: 200,
            y: 150,
            titleBarStyle: 'hidden',
            webPreferences: {
                preload: path.join(__dirname, '../preload/cross.js'),
                userAgent: userAgent,
                contextIsolation: false,
                nodeIntegration: true,
            },
        });
        this.win.removeMenu();
        this.win.once('focus', () => this.win.flashFrame(false));
        this.win.flashFrame(true);
        this.win.loadFile(path.join(__dirname, '../../html/crossWindow.html'));

        this.win.webContents.on('did-finish-load', () => {
            if (!cuiWindow) {
                cuiWindow = new this.crossWindow();
            }
        });
    }

    focus() {
        if (this.win && !this.win.isDestroyed() && !this.win.isFocused()) {
            this.win.focus();
        }
    }
};
