console.log('ticketBuyer script loaded');
const puppeteer = require('puppeteer');
const { 
  viewportWidth, 
  viewportHeight, 
  korailUrl, 
  maxRetries, 
  emailTo 
} = require('../config');
const { setInputValue, selectDropdownOption, 
    clickElement, clickRadioButtonById, clickElementByAlt, 
    sendMail, logMessage } = require('./utils');

// Define the sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function for running automation
async function runAutomation(data) {
    const {
        memberNumber, 
        password, 
        startLocation, 
        endLocation, 
        dateId, 
        departureTime 
    } = data; // Destructure the data object

    await logMessage('Running automation with data:', {
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
    });

    let browser;
    let page;

    try {
        await logMessage('***** Start Process *****');
        browser = await puppeteer.launch({ headless: false });
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
            // Check CAPTCHA and retry
            if (find_retryCnt % 50 === 0) {
                await logMessage('Current ticket find retry count: ' + find_retryCnt);
            }

            await page.waitForSelector('#tableResult');
            const rows = await page.$$('#tableResult tr');

            let imageClicked = false;

            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];

                const imgSrc = await page.evaluate((row) => {
                    const td = row.children[5];
                    if (td) {
                        const img = td.querySelector('img');
                        return img ? img.src : null;
                    }
                    return null;
                }, row);

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
    } catch (error) {
        await logMessage('Error during automation: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Wrapper function to retry the entire automation
async function executeWithRetries(data, maxAttempts) {
    let attempt = 0;
    while (attempt < maxAttempts) {
        try {
            await runAutomation(data);
            break; // Exit if successful
        } catch (error) {
            attempt += 1;
            await logMessage(`※ Run failed (attempt ${attempt}/${maxAttempts}). Retrying...`);
            await sleep(5000); // Wait before retrying
        }
    }
}

module.exports = { runAutomation, executeWithRetries };
