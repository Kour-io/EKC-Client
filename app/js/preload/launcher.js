const { ipcRenderer } = require('electron');
const log = require('electron-log');
const Store = require('electron-store');
const store = new Store();
window.exitLauncher = () => {
    ipcRenderer.invoke('exitLauncher');
};
window.startGame = () => {
    ipcRenderer.invoke('startGame');
};
// Function to handle opening the popup
window.openPopup = () => {
    const dropdown = document.getElementById('accountDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const optionValue = selectedOption.value;
    if (optionValue) {
        // Check if the selected account has a username set
        if (!accountData[optionValue].username) {
            const popup = document.getElementById('loginPopup');
            popup.style.display = 'block';
            document.getElementById('username').value = ''; 
            document.getElementById('username').placeholder = 'Username for ' + accountData[optionValue].originalName;
            document.getElementById('password').value = ''; 
        }
    }
};

// Function to handle closing the popup
window.closePopup = () => {
    const popup = document.getElementById('loginPopup');
    popup.style.display = 'none';
};

// Function to handle removing an account
window.removeAccount = () => {
    const dropdown = document.getElementById('accountDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const optionValue = selectedOption.value;
    if (optionValue) {
        selectedOption.text = accountData[optionValue].originalName;
        accountData[optionValue].username = '';
    }
};

window.login = () => {
    const dropdown = document.getElementById('accountDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const optionValue = selectedOption.value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const selectedIndex = dropdown.selectedIndex; // Add this line
    log.info('Dropdown: ' + selectedIndex + ', Username: ' + username + ', Password: ' + password); // Modify this line
    if (optionValue) {
        accountData[optionValue].username = username;
        selectedOption.text = username ? username : accountData[optionValue].originalName;
    }
    closePopup(); // Call closePopup defined in the preload script
};

// Access the accountData object from the main window
window.accountData = {
    account1: { originalName: 'Account 1', username: '' },
    account2: { originalName: 'Account 2', username: '' },
    account3: { originalName: 'Account 3', username: '' },
    account4: { originalName: 'Account 4', username: '' },
    account5: { originalName: 'Account 5', username: '' },
};

