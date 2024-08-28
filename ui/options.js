document.addEventListener('DOMContentLoaded', () => {
    const startLocationDropdown = document.getElementById('startLocationDropdown');
    const endLocationDropdown = document.getElementById('endLocationDropdown');
    const dateOptionsDropdown = document.getElementById('dateOptions');

    const locations = [
        '서울', '용산', '영등포', '광명', '수원', '평택', '천안아산', '천안', '오송', '조치원',
        '대전', '서대전', '김천', '구미', '김천구미', '대구', '동대구', '경주', '포항', '밀양',
        '구포', '부산', '태화강', '울산(통도사)', '마산', '창원중앙', '경산', '논산', '익산',
        '정읍', '광주송정', '목포', '전주', '순천', '여수EXPO(구,여수역)', '대천', '청량리',
        '춘천', '제천', '동해', '강릉', '행신', '남춘천', '부전', '신탄진', '영동', '왜관',
        '원주', '정동진', '홍성', '나주', '정읍', '남원'
    ];

    function populateDropdown(dropdownElement, items) {
        dropdownElement.innerHTML = ''; // Clear existing items
        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('dropdown-item');
            div.textContent = item;
            div.addEventListener('click', () => {
                const input = dropdownElement.previousElementSibling;
                input.value = item;
                dropdownElement.style.display = 'none';
            });
            dropdownElement.appendChild(div);
        });
    }

    function filterDropdown(inputElement, dropdownElement, items) {
        inputElement.addEventListener('input', () => {
            const filter = inputElement.value.toLowerCase();
            const itemsToShow = items.filter(item => item.toLowerCase().includes(filter));
            const dropdownItems = dropdownElement.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.style.display = itemsToShow.includes(item.textContent) ? 'block' : 'none';
            });
        });
    }

    function populateDateDatalist(startDate, endDate, datalistElement) {
        const dateOptions = [];
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            dateOptions.push(formattedDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        datalistElement.innerHTML = ''; // Clear existing options
        dateOptions.forEach(date => {
            const div = document.createElement('div');
            div.classList.add('dropdown-item');
            div.textContent = date;
            div.addEventListener('click', () => {
                const input = datalistElement.previousElementSibling;
                input.value = date;
                datalistElement.style.display = 'none';
            });
            datalistElement.appendChild(div);
        });
    }

    function toggleDropdown(inputElement, dropdownElement) {
        inputElement.addEventListener('focus', () => {
            dropdownElement.style.display = 'block';
        });

        inputElement.addEventListener('blur', () => {
            setTimeout(() => {
                dropdownElement.style.display = 'none';
            }, 200);
        });
    }

    populateDropdown(startLocationDropdown, locations);
    populateDropdown(endLocationDropdown, locations);
    filterDropdown(document.getElementById('startLocation'), startLocationDropdown, locations);
    filterDropdown(document.getElementById('endLocation'), endLocationDropdown, locations);

    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    const todayString = today.toISOString().split('T')[0];
    const oneMonthLaterString = oneMonthLater.toISOString().split('T')[0];

    populateDateDatalist(todayString, oneMonthLaterString, dateOptionsDropdown);

    toggleDropdown(document.getElementById('startLocation'), startLocationDropdown);
    toggleDropdown(document.getElementById('endLocation'), endLocationDropdown);
    toggleDropdown(document.getElementById('date'), dateOptionsDropdown);
});
