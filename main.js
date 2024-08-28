const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { runAutomation } = require('./src/ticketBuyer');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'ui/renderer.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded.');
    });
}

const menuTemplate = [
    // Your menu template remains unchanged
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('start-automation', async (event, data) => {
    console.log('Automation start requested with data:', data);
    try {
        // Notify renderer process when automation starts
        event.reply('automation-status', 'Automation started...');

        // Show a message box indicating automation has started
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: 'Automation started',
                detail: 'The automation process has started.',
                buttons: ['OK']
            });
        }

        await runAutomation(data);
        
        // Notify renderer process when automation is completed
        event.reply('automation-status', 'Automation completed successfully.');

        // Show a message box indicating automation completed
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: 'Automation completed',
                detail: 'The automation process completed successfully.',
                buttons: ['OK']
            });
        }
    } catch (error) {
        // Notify renderer process if there's an error
        event.reply('automation-status', `Error: ${error.message}`);
        console.error('Error during automation:', error);

        // Show an error message box
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                message: 'Error during automation',
                detail: `An error occurred during automation: ${error.message}`,
                buttons: ['OK']
            });
        }
    }
});
