const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { runAutomation } = require('./src/puppeteerAutomation');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 960,
        height: 540,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,  // This should be false if using nodeIntegration
            preload: path.join(__dirname, 'ui/renderer.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded.');
    });
}

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

ipcMain.on('start-automation', async (event) => {
    try {
        // Send a message to the renderer process when automation starts
        event.reply('automation-status', 'Automation started...');
        
        await runAutomation();
        
        // Notify renderer process when automation is completed
        event.reply('automation-status', 'Automation completed successfully.');
    } catch (error) {
        // Notify renderer process if there's an error
        event.reply('automation-status', `Error: ${error.message}`);
    }
});
