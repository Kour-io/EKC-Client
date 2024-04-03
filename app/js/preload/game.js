// game.js
const color = require('colors');
const { ipcRenderer, remote } = require('electron');
const log = require('electron-logger');
const Store = require('electron-store');
const store = new Store();

log.info('[GAME]'.bgYellow, 'Game.js preload script loaded'.yellow);


const altData = store.get('amlData');


document.addEventListener('DOMContentLoaded', () => {
    const firebaseUser = firebase.auth().currentUser;
        try {
            if (firebaseUser) {
                window.LogoutUser();
                window.loginWithUsernameAndPassword(altData.username, altData.password);
            } 
            else {
                window.loginWithUsernameAndPassword(altData.username, altData.password);
            }
        } 
        catch (error) {
            log.info('error at game.js', error);
        }
});
