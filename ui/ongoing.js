document.addEventListener("DOMContentLoaded", function() {
    // Log 메시지 업데이트를 위한 예시 타이머
    const logArea = document.getElementById("logArea");
    let logIndex = 1;

    // '작업 중지' 버튼 클릭 이벤트 처리
    document.getElementById("stopAutomationButton").addEventListener("click", function() {
        clearInterval(logInterval); // 로그 메시지 업데이트 중지
        alert("자동화 작업이 중지되었습니다.");
        window.location.href = 'index.html'; // Replace with the actual path to your main page if different
    });
});
