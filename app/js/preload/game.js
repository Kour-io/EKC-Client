// game.js
const color = require('colors');
const { ipcRenderer } = require('electron');
const log = require('electron-logger');


log.info('[GAME]'.bgYellow, 'Game.js preload script loaded'.yellow);
const isCursorCaptured = document.pointerLockElement !== null;
log.info('Cursor captured:'.red, isCursorCaptured);

// Send cursor capture status to the main process
ipcRenderer.send('cursor-capture-status', isCursorCaptured);

document.addEventListener('DOMContentLoaded', () => {
    const img = new Image();
        img.src = 'https://media.discordapp.net/attachments/1003112094473916488/1049006495074889748/White_TenZ_crosshair_.png?ex=660995ee&is=65f720ee&hm=362ebef06035acbfafb81041c939bdd153d61bcf9fd3205a4768c507c77bde4c&=&format=webp&quality=lossless&width=138&height=138';
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.width = '70px';
        img.style.height = '70px';
        document.body.appendChild(img);

    const loadCrosshairPrefs = () => {
        const sizeX = localStorage.getItem('crosshairSizeX') || '70';
        const sizeY = localStorage.getItem('crosshairSizeY') || '70';
        const url = localStorage.getItem('crosshairURL') || '';
        return { sizeX, sizeY, url };
    };

    const saveCrosshairPrefs = () => {
        localStorage.setItem('crosshairSizeX', cursorInputX.value);
        localStorage.setItem('crosshairSizeY', cursorInputY.value);
        localStorage.setItem('crosshairURL', urlInput.value);
        updateCrosshair();
    };

    const updateCrosshair = () => {
        const crosshairImage = document.getElementById('crosshairImage');
        const { sizeX, sizeY, url } = loadCrosshairPrefs();
        crosshairImage.style.width = sizeX + 'px';
        crosshairImage.style.height = sizeY + 'px';
        crosshairImage.src = url;
    };

    updateCrosshair(); // Load crosshair on start

    function crossHairInjectHtml() {
        const { sizeX, sizeY, url } = loadCrosshairPrefs();
        return `
            <button id="openCloseButton" style="display: none;">Open UI</button>
            <div id="popup" style="display: none; background-color: white; font-family: Arial, sans-serif;">
                <div class="input-group">
                    <label for="cursorInputX">X:</label>
                    <input type="number" id="cursorInputX" min="0" max="1000" value="${sizeX}">
                    <i style="font-style: italic; font-size: 12px;">Please use arrow up and down to change crosshair size</i>
                </div>
                <div class="input-group">
                    <label for="cursorInputY">Y:</label>
                    <input type="number" id="cursorInputY" min="0" max="1000" value="${sizeY}">
                    <i style="font-style: italic; font-size: 12px;">This feature is still VERY BETA and will be updated!</i>
                </div>
                <label for="urlInput">Enter URL:</label>
                <input type="text" id="urlInput" value="${url}">
                <button id="saveButton">Save</button>
            </div>
        `;
    }

    const crossDiv = document.createElement('div');
    crossDiv.innerHTML = crossHairInjectHtml();
    crossDiv.style.cssText = `
        position: absolute;
        bottom: 300px;
        left: 90px;
    `;
    document.body.appendChild(crossDiv);

    const openCloseButton = document.getElementById('openCloseButton');
    const popup = document.getElementById('popup');
    const cursorInputX = document.getElementById('cursorInputX');
    const cursorInputY = document.getElementById('cursorInputY');
    const urlInput = document.getElementById('urlInput');
    const saveButton = document.getElementById('saveButton');

    openCloseButton.addEventListener('click', () => {
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        openCloseButton.textContent = popup.style.display === 'block' ? 'Close UI' : 'Open UI';
    });

    saveButton.addEventListener('click', () => {
        saveCrosshairPrefs();
    });

    document.addEventListener('keydown', (event) => {
        // Check if Ctrl, Alt, and V keys are pressed simultaneously
        if (event.ctrlKey && event.altKey && event.key === 'v') {
            // Toggle visibility of the openCloseButton
            openCloseButton.style.display = (openCloseButton.style.display === 'none') ? 'block' : 'none';
        }
    });
});
