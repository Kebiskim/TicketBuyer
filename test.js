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
  trainType, 
  maxRetries, 
  emailTo 
} = require('./config');
// Function imports from utils
const { setInputValue, selectDropdownOption, clickElement, clickRadioButtonById, 
    clickElementByAlt, sendMail, logMessage } = require('./utils');

// Define the sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAutomation() {
  let browser;
  let page;
  
  try {
    // Start browser in non-headless mode
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
    await selectDropdownOption(page, '#selGoTrainRa00', trainType);

    // Click search button
    await clickElement(page, '[alt="승차권예매"]');

    // Select KTX & 조회하기 hit 버튼
    await clickRadioButtonById(page, 'selGoTrainRa00');
    await clickElementByAlt(page, '조회하기');

    await logMessage('=== Start finding an available seat ===');

    // Start the retry loop
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Log retry count every 20 retries
        if (retryCount % 20 === 0) {
          await logMessage('Current retry count: ' + retryCount);
        }

        await page.waitForSelector('#tableResult');
        const rows = await page.$$('#tableResult tr');

        let imageClicked = false;

        for (let index = 0; index < rows.length; index++) {
          // Only process the first or second row
          if (index > 1) break;

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
            'Image Clicked Notification',
            'An image was clicked successfully.'
          );
          break;
        }

        await page.reload({ waitUntil: 'networkidle0' });
        await sleep(2500); // Wait to avoid CAPTCHA
        retryCount += 1;

      } catch (innerError) {
        await logMessage('Error during retry: ' + innerError.message);
        await page.reload({ waitUntil: 'networkidle0' });
        await sleep(2500); // Wait before next retry
        retryCount += 1;
      }
    }

  } catch (error) {
    await logMessage('Critical Error: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the automation
runAutomation();
