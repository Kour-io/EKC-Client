const { app, BrowserWindow, globalShortcut, clipboard, ipcRenderer } = require('electron');
const log = require('electron-log');
const colors = require('colors');
const platformType = require('os').platform();
const fs = require('fs');
const path = require('path');
const rpc = require('./rpc.js');
const Toastify = require('toastify-js');
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
    launcher: null,
};


exports.launchGame = (url = null) => {
    windows.game = new this.gameWindow(url);
    return windows.game;
};

exports.openCui = () => {
    return new exports.crossWindow();
};

exports.startLauncher = () => {
    windows.launcher = new this.launcherWindow();
    return windows.launcher;
};

exports.closeLauncher = () => {
    if (windows.launcher && !windows.launcher.win.isDestroyed()) {
        windows.launcher.win.close();
        windows.launcher = null; // Reset launcher reference
    }
};

let cuiWindow = null;

const launchCui = () => {
    if (cuiWindow && !cuiWindow.win.isDestroyed()) { // Check if the window is already open
        cuiWindow.focus(); // Bring the existing window to focus
    } 
    else {
        cuiWindow = exports.openCui(); // Create a new window if it's not already open
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
                gifImg.style.pointerEvents = 'none';
                document.body.appendChild(gifImg);
            `);
        }

        const updateCrosshair = () => {
            log.info('Updating crosshair...');
            const { sizeX, sizeY, url } = loadCrosshairPrefs();
            log.info('Crosshair preferences:', sizeX, sizeY, url);
            win.webContents.executeJavaScript(`
                console.log('Executing JavaScript to update crosshair...');
                const crosshairImage = document.getElementById('crosshairImage');
                console.log('Crosshair image:', crosshairImage);
                if (!crosshairImage) {
                    const img = new Image();
                    img.style.position = 'absolute';
                    img.id = 'crosshairImage';
                    img.style.top = '50%';
                    img.style.left = '50%';
                    img.style.userSelect = 'none';
                    img.style.pointerEvents = 'none';
                    img.style.transform = 'translate(-50%, -50%)';
                    img.onload = function() {
                        this.width = ${sizeX};
                        this.height = ${sizeY};
                    };
                    img.src = "${url}"; // Set the src attribute to the URL
                    console.log('Appended new crosshair image:', img);
                    document.body.appendChild(img);
                } else {
                    crosshairImage.src = "${url}";
                    crosshairImage.onload = function() {
                        this.width = ${sizeX};
                        this.height = ${sizeY};
                    };
                    console.log('Updated existing crosshair image:', crosshairImage);
                }
            `);
        };
        
    
        const loadCrosshairPrefs = () => {
            const sizeX = store.get('xScale') || '70';
            const sizeY = store.get('yScale') || '70';
            const url = store.get('url') || '';
            return { sizeX, sizeY, url };
        };


        win.once('ready-to-show', () => {
            console.log('[MAIN]'.bgGreen, 'Web Content Ready To Show'.green);
            updateCrosshair(); 

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
                win.loadURL('https://kour.io');
                
            });

            registerShortcut('F6', () => {
                const clipboardText = clipboard.readText();
                const focusedWindow = BrowserWindow.getFocusedWindow();
                
                if (focusedWindow && clipboardText.startsWith('https://kour.io')) {
                    focusedWindow.loadURL(clipboardText);
                }
            });
            

            registerShortcut('CmdOrCtrl+Alt+V', () => {
                launchCui();
            });

            registerShortcut('Alt+1', () => {
                win.loadURL('https://kour.io/op');
                
            });

            for (let i = 2; i <= 9; i++) {
                registerShortcut(`Alt+${i}`, () => {
                    win.loadURL(`https://kour.io/op${i}`);
                    
                });
            }
            
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

exports.launcherWindow = class {
    constructor() {
        this.win = new BrowserWindow({
            width: 1920,
            height: 1080,
            titleBarStyle: 'hidden',
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, '../preload/launcher.js'),
                userAgent: userAgent,
                contextIsolation: false,
                nodeIntegration: true,
            },
        });
        this.win.removeMenu();
        this.win.once('focus', () => this.win.flashFrame(false));
        this.win.flashFrame(true);
        this.win.loadFile(path.join(__dirname, '../../html/launcher.html'));

    }

};