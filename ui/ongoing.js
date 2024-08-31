console.log('ongoing.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const logArea = document.getElementById('logArea');
    const stopAutomationButton = document.getElementById('stopAutomationButton');

    // 로그 메시지 수신 및 표시
    window.electron.ipcRenderer.on('log', (message) => {
        if (logArea) {
            logArea.value += message + '\n';
        }
    });

    // '작업 중지' 버튼 클릭 이벤트 처리
    if (stopAutomationButton) {
        stopAutomationButton.addEventListener('click', () => {
            // logInterval 변수가 정의되어 있다고 가정합니다.
            if (typeof logInterval !== 'undefined') {
                clearInterval(logInterval); // 로그 메시지 업데이트 중지
            }
            alert('자동화 작업이 중지되었습니다.');
            window.location.href = 'index.html'; // 실제 메인 페이지 경로로 변경
        });
    }
});