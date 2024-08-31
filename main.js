const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { executeWithRetries } = require('./src/ticketBuyer');
// global.__static = path.join(__dirname, 'static').replace(/\\/g, '\\\\');

let mainWindow;  // Declare `mainWindow` globally to access in IPC events

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 800,
        webPreferences: {
            // preload: path.resolve(getElectronApp().getAppPath(), 'preload.js'),            
            // preload: path.resolve(app.getAppPath(), 'static', 'preload.js'),
            // preload: path.resolve(__dirname, 'ui/preload.js'),
            preload: path.resolve('C:/Coding/TickeyBuyer_FuncAdded/ui/preload.js'),

            // preload 못 불러오는 이슈 아래 주석을 통해 해결!
            // contextIsolation: false, // No isolation between contexts
            // nodeIntegration을 활성화하면 보안 문제가 발생할 수 있으므로, 
            // 필요에 따라 contextIsolation을 false로 설정하여 Node.js API를 사용할 수 있도록 합니다.
            nodeIntegration: true // Allow renderer to use Node.js APIs
        }
    });
    mainWindow.loadFile(path.join(__dirname, './ui/index.html'));

    // ★ TEST
    mainWindow.webContents.openDevTools();

      // 로그 메시지를 렌더러 프로세스로 전달
    ipcMain.on('log-message', (event, message) => {
        mainWindow.webContents.send('log', message);
    });

    // mainWindow.webContents.on('did-finish-load', () => {
    //     console.log('App Window loaded.');
    //     mainWindow.webContents.send('log', 'Chrome이 실행되었습니다.');
    // });
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
    console.log('[main.js] Automation start requested with data:', data);
    try {
        // Pass data to runAutomation
        await executeWithRetries(data, 3);

        // Show a message box indicating automation completed
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: '작업 종료 알림',
                detail: '자동화 작업이 종료되었습니다.',
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
