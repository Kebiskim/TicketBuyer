console.log('[renderer.js] Renderer script loaded');
const { ipcRenderer } = require('electron');
const iconv = require('iconv-lite');

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const startAutomationButton = document.getElementById('startAutomationButton');

    if (startButton) {
        startButton.addEventListener('click', () => {
            const data = {
                memberNumber: document.getElementById('memberNumber').value,
                password: document.getElementById('password').value,
                startLocation: iconv.encode(document.getElementById('startLocation').value, 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
                endLocation: iconv.encode(document.getElementById('endLocation').value, 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
                dateId: document.getElementById('dateId').value,
                departureTime: document.getElementById('departureTime').value
            };

            ipcRenderer.send('start-automation', data);
        });
    }

    if (startAutomationButton) {
        startAutomationButton.addEventListener('click', () => {
            window.location.href = "ongoing.html";

            const data = {
                memberNumber: '1041537669',
                password: 'Dusdn067^^kr',
                startLocation: iconv.encode('서울', 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
                endLocation: iconv.encode('부산', 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
                dateId: '2024-09-13',
                departureTime: '오후01'
            };

            ipcRenderer.send('start-automation', data);
            ipcRenderer.on('automation-status', (event, status) => {
                console.log('Automation status:', status);
            });
        });
    }
});

ipcRenderer.on('automation-status', (event, status) => {
    console.log(status);
    alert(status);
});

ipcRenderer.on('log', (event, message) => {
    console.log(message);
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.value += message + '\n';
    }
});





// console.log('Renderer script loaded');
// const { ipcRenderer } = require('electron');
// const iconv = require('iconv-lite');

// document.getElementById('startButton').addEventListener('click', () => {
//     const data = {
//         memberNumber: document.getElementById('memberNumber').value,
//         password: document.getElementById('password').value,
//         startLocation: iconv.encode(document.getElementById('startLocation').value, 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
//         endLocation: iconv.encode(document.getElementById('endLocation').value, 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
//         dateId: document.getElementById('dateId').value,
//         departureTime: document.getElementById('departureTime').value
//     };

//     ipcRenderer.send('start-automation', data);
// });

// ipcRenderer.on('automation-status', (event, status) => {
//     console.log(status);
//     alert(status);
// });

// document.getElementById("startAutomationButton").addEventListener("click", function() {
//     console.log('Renderer Start Btn Clicked');

   

//     const data = {
//         memberNumber: '1041537669',
//         password: '',
//         startLocation: iconv.encode('서울', 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
//         endLocation: iconv.encode('부산', 'utf-8').toString('base64'), // UTF-8 인코딩 후 Base64로 변환
//         dateId: '2024-09-01',
//         departureTime: '12:00'
//     };
    

//     // Create data object
//     // const data = {
//     //     memberNumber,
//     //     password,
//     //     startLocation,
//     //     endLocation,
//     //     dateId,
//     //     departureTime
//     // };

//     // ★ TEST용
  
//     // Use ipcRenderer directly
//     ipcRenderer.send('start-automation', data);
//     ipcRenderer.on('automation-status', (event, status) => {
//         console.log('Automation status:', status);
//     });

//     // window.location.href = "ongoing.html";
// });





 // // ★ TEST용
    // // Collect values from form fields
    // const memberNumber = document.getElementById("memberNumber").value.trim();
    // const password = document.getElementById("password").value.trim();
    // const startLocation = document.getElementById("startLocation").value.trim();
    // const endLocation = document.getElementById("endLocation").value.trim();
    // const dateId = document.getElementById("date").value.trim(); // assuming dateId is entered here
    // const departureTime = document.getElementById("time").value.trim(); // assuming departureTime is entered here

    // // Function to show the custom alert
    // function showCustomAlert(title, message) {
    //     customAlertTitle.textContent = title;
    //     customAlertMessage.textContent = message;
    //     customAlert.style.display = 'block';
    // }

    // ★ TEST용
    // Validate form data
    // document.getElementById('startAutomationButton').addEventListener('click', () => {
    // if (!memberNumber || !password || !startLocation || !endLocation || !dateId || !departureTime) {
    //     showCustomAlert('입력 오류', '입력상자 안의 값을 모두 입력하세요.');
    //     return; // Prevent further execution
    // }