const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { executeWithRetries } = require('./src/ticketBuyer');
// const fs = require('fs');

let mainWindow;  // Declare `mainWindow` globally to access in IPC events

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 800,
        webPreferences: {
            // preload: path.join(__dirname, './ui/renderer.js'), 
            nodeIntegration: true, // Allow renderer to use Node.js APIs
            contextIsolation: false // No isolation between contexts
        }
    });
    mainWindow.loadFile(path.join(__dirname, './ui/index.html'));

    // ★ TEST
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('App Window loaded.');
        mainWindow.webContents.send('log', 'Chrome이 실행되었습니다.');
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

// Base64 디코딩 함수
function base64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// IPC handler
ipcMain.on('start-automation', async (event, data) => {
     // UTF-8 디코딩
    data.startLocation = base64DecodeUnicode(data.startLocation);
    data.endLocation = base64DecodeUnicode(data.endLocation);

    console.log('[main.js] Automation start requested with data:', data);
    try {
        // Notify renderer process when automation starts
        // event.reply('automation-status', 'Automation started...');

        // ☆ Check 
        // Show a message box indicating automation has started
        // if (mainWindow) {
        //     const messageBox = dialog.showMessageBox(mainWindow, {
        //         type: 'info',
        //         message: '작업 시작 알림',
        //         detail: '자동화 작업을 시작합니다.',
        //         buttons: ['OK']
        //     });

        //     // 1초 후에 창을 닫기
        //     setTimeout(() => {
        //         messageBox.then(box => {
        //             box.response = 0; // OK 버튼 클릭을 시뮬레이션
        //         });
        //     }, 1000);
        // }

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
