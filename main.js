const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { runAutomation } = require('./src/ticketBuyer');

// Create the main window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 960,
        height: 720,
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

// Define the menu template
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Start Automation',
                click: () => {
                    // Send message to renderer process to start automation
                    const focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                        focusedWindow.webContents.send('start-automation');
                    }
                }
            },
            {
                label: 'Exit',
                role: 'quit'
            }
        ]
    },
    // Removed 'Edit' section
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Toggle Full Screen',
                role: 'toggleFullScreen'
            }
        ]
    },
    {
        label: 'Window',
        submenu: [
            {
                label: 'Minimize',
                role: 'minimize'
            },
            {
                label: 'Close',
                role: 'close'
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Learn More',
                click: () => {
                    require('electron').shell.openExternal('https://electronjs.org');
                }
            },
            {
                label: 'Documentation',
                click: () => {
                    require('electron').shell.openExternal('https://electronjs.org/docs');
                }
            },
            {
                label: 'Community Discussions',
                click: () => {
                    require('electron').shell.openExternal('https://electronjs.org/community');
                }
            },
            {
                label: 'Search Issues',
                click: () => {
                    require('electron').shell.openExternal('https://github.com/electron/electron/issues');
                }
            }
        ]
    }
];

// Build and set the menu
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
