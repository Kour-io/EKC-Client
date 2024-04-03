/* eslint-disable quotes */
/* eslint-disable max-statements-per-line */
const { app, BrowserWindow, globalShortcut, clipboard } = require('electron');
const log = require('electron-log');
const { registerShortcut, unregisterAllShortcuts } = require('./shortcuts.js');
const path = require('path');
const rpc = require('./rpc.js');
const Toastify = require('toastify-js');
const Store = require('electron-store');
const store = new Store();
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0';

let wombo = null;
try {
    wombo = require('../../private.js');
} 
catch (error) {
    wombo = null;
}

process.on('unhandledRejection', (error) => console.error('Unhandled Promise Rejection:', error));

const windows = { game: null, launcher: null };
const launchGame = (url = null) => { windows.game = new gameWindow(url); return windows.game; };
const openCui = () => new crossWindow();
const startLauncher = () => { windows.launcher = new launcherWindow(); return windows.launcher; };
const closeLauncher = () => { if (windows.launcher && !windows.launcher.win.isDestroyed()) { windows.launcher.win.close(); windows.launcher = null; } };
let cuiWindow = null;

const launchCui = () => {
    if (cuiWindow && !cuiWindow.win.isDestroyed()) cuiWindow.focus();
    else cuiWindow = openCui();
    return cuiWindow;
};

class gameWindow {
    constructor(url) {
        const win = new BrowserWindow({
            width: 1920,
            height: 1080,
            titleBarStyle: 'hidden',
            webPreferences: { preload: path.join(__dirname, '../preload/game.js'), userAgent, contextIsolation: false, nodeIntegration: false, resizeable: false },
        });

        win.removeMenu();
        win.maximize();
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        win.loadURL((!url) ? 'https://kour.io' : url);

        win.on('enter-full-screen', () => store.set('Fullscreen', true));
        win.on('leave-full-screen', () => store.set('Fullscreen', false));
        win.setFullScreen(store.get('Fullscreen'));

        const updateCrosshair = () => {
            const { sizeX, sizeY, url } = loadCrosshairPrefs();
            win.webContents.executeJavaScript(`
                const crosshairImage = document.getElementById('crosshairImage');
                if (!crosshairImage) { const img = new Image(); img.style.position = 'absolute'; img.id = 'crosshairImage'; img.style.top = '50%'; img.style.left = '50%'; img.style.userSelect = 'none'; img.style.pointerEvents = 'none'; img.style.transform = 'translate(-50%, -50%)'; img.onload = function() { this.width = ${sizeX}; this.height = ${sizeY}; }; img.src = "${url}"; document.body.appendChild(img); } else { crosshairImage.src = "${url}"; crosshairImage.onload = function() { this.width = ${sizeX}; this.height = ${sizeY}; }; }
            `);
        };

        const loadCrosshairPrefs = () => {
            const sizeX = store.get('xScale') || '70';
            const sizeY = store.get('yScale') || '70';
            const url = store.get('url') || '';
            return { sizeX, sizeY, url };
        };

        win.once('ready-to-show', () => {
            updateCrosshair(); 
            if (wombo) globalShortcut.register(wombo.wombo, () => win.webContents.openDevTools({ mode: 'detach' }));
            registerShortcut('F11', () => BrowserWindow.getFocusedWindow()?.setFullScreen(!BrowserWindow.getFocusedWindow()?.isFullScreen()));
            registerShortcut('Escape', () => BrowserWindow.getFocusedWindow()?.webContents.executeJavaScript(`if (document.pointerLockElement) document.exitPointerLock();`));
            registerShortcut('F5', () => win.loadURL('https://kour.io'));
            registerShortcut('F6', () => { const clipboardText = clipboard.readText(); if (clipboardText.startsWith('https://kour.io')) BrowserWindow.getFocusedWindow()?.loadURL(clipboardText); });
            registerShortcut('CmdOrCtrl+Alt+V', () => launchCui());
            registerShortcut('Alt+1', () => win.loadURL('https://kour.io/op'));
            for (let i = 2; i <= 9; i++) registerShortcut(`Alt+${i}`, () => win.loadURL(`https://kour.io/op${i}`));
        });

        const rpcInstance = new rpc();
        win.webContents.on('did-finish-load', () => updateCrosshair());
    }
}

class crossWindow {
    constructor() {
        this.win = new BrowserWindow({
            width: 550,
            height: 200,
            y: 150,
            titleBarStyle: 'hidden',
            webPreferences: { preload: path.join(__dirname, '../preload/cross.js'), userAgent, contextIsolation: false, nodeIntegration: true },
        });
        this.win.removeMenu();
        this.win.once('focus', () => this.win.flashFrame(false));
        this.win.flashFrame(true);
        this.win.loadFile(path.join(__dirname, '../../html/crossWindow.html'));
        this.win.webContents.on('did-finish-load', () => { if (!cuiWindow) cuiWindow = new crossWindow(); });
    }
    focus() { if (this.win && !this.win.isDestroyed() && !this.win.isFocused()) this.win.focus(); }
}

class launcherWindow {
    constructor() {
        this.win = new BrowserWindow({
            width: 1920,
            height: 1080,
            titleBarStyle: 'hidden',
            frame: false,
            webPreferences: { preload: path.join(__dirname, '../preload/launcher.js'), userAgent, contextIsolation: false, nodeIntegration: true },
        });
        this.win.removeMenu();
        this.win.once('focus', () => this.win.flashFrame(false));
        this.win.flashFrame(true);
        this.win.loadFile(path.join(__dirname, '../../html/launcher.html'));
    }
}

module.exports = { launchGame, openCui, startLauncher, closeLauncher };
