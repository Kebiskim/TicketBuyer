const { ipcRenderer } = require('electron');

// document.getElementById('startAutomationButton').addEventListener('click', () => {
//     ipcRenderer.send('start-automation');
// });

// Listen for messages from the main process
// ipcRenderer.on('automation-status', (event, message) => {
//     // Update the UI with the status message
//     document.getElementById('status').innerText = message;
// });