// game.js
const log = require('electron-log');
const Store = require('electron-store');
const store = new Store();

log.info('[GAME]', 'Game.js preload script loaded');

const altData = store.get('amlData');

//Fix for Kour's pointer lock issue on old chromium version. 
//Kour's LockCursor function expects a promise return type from requestPointerLock, but the return type of requestPointerLock being a promise is still just an experimental propsal not fully supported in all browsers: (Read the "Note" section: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock#browser_compatibility )
const _requestPointerLock = HTMLCanvasElement.prototype.requestPointerLock;
HTMLCanvasElement.prototype.requestPointerLock = function () {
    return new Promise((resolve, reject) => {
        try {
            resolve(_requestPointerLock.apply(this, arguments));
        } catch (error) {
            reject(error);
        }
    });
}

Object.defineProperty(window, 'unityInstance', {
    get() {
        return window._unityInstance;
    },
    set(val) {
        window._unityInstance = val;
        gameLoaded();
    },
});

const gameLoaded = () => { //Waits for unityInstance to be defined, required before interacting with firebase stuff
    try { 
        if (!altData.username || !altData.password) return; // Only try to log in if the user has selected a valid account in alt manager

        const firebaseUser = firebase.auth().currentUser;
        if (firebaseUser) {
            window.LogoutUser();
            window.loginWithUsernameAndPassword(altData.username, altData.password);
        } else {
            window.loginWithUsernameAndPassword(altData.username, altData.password);
        }
    }
    catch (error) {
        log.error('Error in game.js:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    //Unused
});
