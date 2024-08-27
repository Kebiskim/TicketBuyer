const { ipcRenderer } = require('electron');
const puppeteer = require('puppeteer');
const { 
  viewportWidth, 
  viewportHeight, 
  korailUrl, 
  memberNumber, 
  password, 
  startLocation, 
  endLocation, 
  dateId, 
  departureTime, 
  maxRetries, 
  emailTo 
} = require('./config');
// ★ 여기 선언부 (.utils에서 function 호출부) 까먹지 말자!!
const { setInputValue, 
    selectDropdownOption, 
    clickElement, 
    clickRadioButtonById, 
    clickElementByAlt, 
    sendMail, 
    logMessage } = require('./utils');

// Define the sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function runAutomation() {
    // Example: Send a log message to renderer process
    ipcRenderer.send('automation-status', 'Starting Puppeteer automation...');

    let browser;
    let page;

        // Start browser in non-headless mode
        await logMessage('***** Start Process *****');
        browser = await puppeteer.launch({ headless: false   
            // devtools: true 
          });
        page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: viewportWidth, height: viewportHeight });

    // Navigate to the URL
    await page.goto(korailUrl);

    // Fill in member number and password
    await setInputValue(page, 'input[title="회원번호 열자리 입력"]', memberNumber);
    await setInputValue(page, 'input[title="8자리이상 영문 숫자 특수문자"]', password);

    // Click login button
    await clickElement(page, 'li.btn_login');
    await page.waitForNavigation();
    await logMessage('Login Success');

    // Set start and end locations
    await setInputValue(page, '#txtGoStart', startLocation);
    await setInputValue(page, '#txtGoEnd', endLocation);

    // Click calendar popup
    await clickElement(page, '[title="달력 팝업창이 뜹니다."]');

    // Handle the popup window
    const pages = await browser.pages();
    const popupPage = pages[pages.length - 1];
    await popupPage.waitForSelector(`#${dateId}`);
    await popupPage.click(`#${dateId}`);

    await logMessage('Date selection successful: ' + dateId);

    // Switch back to main page
    await page.bringToFront();

    // Select departure time and train type
    await selectDropdownOption(page, '[title="출발일시:시"]', departureTime);

    // Click search button
    await clickElement(page, '[alt="승차권예매"]');

    // Select KTX & 조회하기 hit 버튼
    await clickRadioButtonById(page, 'selGoTrainRa00');
    await clickElementByAlt(page, '조회하기');

    await logMessage('=== Start finding an available seat ===');

    // Start the retry loop
    let find_retryCnt = 0;

    while (find_retryCnt < maxRetries) {
        // ※ capcha 나오는 구간 체크해야 함
        // ※ IP를 바꾼다고 해서 (wifi) captcha가 안 나오는 것은 아님
        if (find_retryCnt % 50 === 0){
            await logMessage('Current ticket find retry count: ' + find_retryCnt);
        }

        await page.waitForSelector('#tableResult');
        const rows = await page.$$('#tableResult tr');

        let imageClicked = false;

        for (let index = 0; index < rows.length; index++) {
            // Only process the designated rows
            // if (index > 2) break;

            const row = rows[index];

            const imgSrc = await page.evaluate((row) => {
                const td = row.children[5];
                if (td) {
                    const img = td.querySelector('img');
                    return img ? img.src : null;
                }
                return null;
            }, row);

            // Check if the image source is not the sell-off button
            // If found 2 btns, click above
            if (imgSrc && !imgSrc.includes('/docs/2007/img/common/btn_selloff.gif')) {
                await page.evaluate((row) => {
                    const td = row.children[5];
                    if (td) {
                        const img = td.querySelector('img');
                        if (img) {
                            img.click();
                        }
                    }
                }, row);

                imageClicked = true;
                break;
            }
        }

        if (imageClicked) {
            await logMessage('티켓 예매 성공');
            await sendMail(
                emailTo,
                'Korail Ticket Reserved Notification',
                'A Ticket purchase has been done successfully.'
            );
            break;
        }

        await page.reload({ waitUntil: 'networkidle0' });
        // wait to avoid CAPTCHA
        await sleep(5000); 
        find_retryCnt += 1;
  }
}

// Wrapper function to retry the entire automation
async function executeWithRetries(maxAttempts) {
    let attempt = 0;
    while (attempt < maxAttempts) {
        try {
            await runAutomation();
            break; // Exit if successful
        } catch (error) {
            attempt += 1;
            await logMessage(`※ Run failed (attempt ${attempt}/${maxAttempts}). Retrying...`);
            await sleep(5000); // Wait before retrying
        }
    }
}

// standalone
// executeWithRetries(3);
module.exports = { runAutomation, executeWithRetries };