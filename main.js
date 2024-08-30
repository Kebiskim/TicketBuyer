const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { runAutomation } = require('./src/ticketBuyer');

let mainWindow;  // Declare `mainWindow` globally to access in IPC events

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, './ui/renderer.js'), 
            nodeIntegration: true, // Allow renderer to use Node.js APIs
            contextIsolation: false // No isolation between contexts
        }
    });
    mainWindow.loadFile(path.join(__dirname, './ui/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded.');
    });
}

// Setup menu if needed
const menuTemplate = [/* Your menu template */];
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log('App Closed');
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('Create Window');
        createWindow();
    }
});

// IPC handler
ipcMain.on('start-automation', async (event, data) => {
    console.log('Sending data:', JSON.stringify(data, null, 2));
    console.log('Received data:', JSON.stringify(data, null, 2));

    console.log('[main.js] Automation start requested with data:', data);
    try {
        // Notify renderer process when automation starts
        event.reply('automation-status', 'Automation started...');

        // Show a message box indicating automation has started
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: '작업 시작 알림',
                detail: '자동화 작업을 시작합니다.',
                buttons: ['OK']
            });
        }

        // Pass data to runAutomation
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
