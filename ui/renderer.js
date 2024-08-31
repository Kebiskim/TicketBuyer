console.log('Renderer script loaded');

document.getElementById("startAutomationButton").addEventListener("click", function() {
    console.log('Renderer Start Btn Clicked');

    // Collect values from form fields
    const memberNumber = document.getElementById("memberNumber").value.trim();
    const password = document.getElementById("password").value.trim();
    const startLocation = document.getElementById("startLocation").value.trim();
    const endLocation = document.getElementById("endLocation").value.trim();
    const dateId = document.getElementById("date").value.trim(); // assuming dateId is entered here
    const departureTime = document.getElementById("time").value.trim(); // assuming departureTime is entered here

    // Function to show the custom alert
    function showCustomAlert(title, message) {
        customAlertTitle.textContent = title;
        customAlertMessage.textContent = message;
        customAlert.style.display = 'block';
    }

    // ★ TEST용
    // Validate form data
    // document.getElementById('startAutomationButton').addEventListener('click', () => {
    // if (!memberNumber || !password || !startLocation || !endLocation || !dateId || !departureTime) {
    //     showCustomAlert('입력 오류', '입력상자 안의 값을 모두 입력하세요.');
    //     return; // Prevent further execution
    // }
    const data = {
        memberNumber: '1041537669',
        password: '',
        startLocation: '서울',
        endLocation: '부산',
        dateId: '2024-09-01',
        departureTime: '12:00'
    };
    console.log('Sending data to main process:', JSON.stringify(data));

    console.log('TEST data set');


    // Create data object
    // const data = {
    //     memberNumber,
    //     password,
    //     startLocation,
    //     endLocation,
    //     dateId,
    //     departureTime
    // };

    // ★ TEST용
  
    // Use ipcRenderer directly
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('start-automation', data);
    ipcRenderer.on('automation-status', (event, status) => {
        console.log('Automation status:', status);
    });


    // Redirect to another page (if needed)
    window.location.href = "ongoing.html";
});
