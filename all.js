// Import necessary libraries
const puppeteer = require('puppeteer');
const sendMail = require('./sendMail');
require('dotenv').config(); // Load environment variables

(async () => {
  // Start browser in non-headless mode
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  // Set viewport size from environment variables
  const viewportWidth = parseInt(process.env.VIEWPORT_WIDTH, 10) || 960;
  const viewportHeight = parseInt(process.env.VIEWPORT_HEIGHT, 10) || 1080;

  await page.setViewport({
    width: viewportWidth,
    height: viewportHeight
  });

  // Navigate to the URL from environment variables
  const korailUrl = process.env.WEBPAGE_URL;
  await page.goto(korailUrl);

  // Fill in member number
  const memberNumber = process.env.MEMBER_NUMBER;
  await page.waitForSelector('input[title="회원번호 열자리 입력"]');
  await page.type('input[title="회원번호 열자리 입력"]', memberNumber);

  // Fill in password
  const password = process.env.PASSWORD;
  await page.waitForSelector('input[title="8자리이상 영문 숫자 특수문자"]');
  await page.type('input[title="8자리이상 영문 숫자 특수문자"]', password);

  // Click login button
  await page.waitForSelector('li.btn_login');
  await page.click('li.btn_login');
  await page.waitForNavigation();

  // Set start and end locations
  const startLocation = process.env.START_LOCATION;
  const endLocation = process.env.END_LOCATION;

  await page.waitForSelector('#txtGoStart');
  await page.evaluate((startLocation) => {
    document.getElementById('txtGoStart').value = startLocation;
  }, startLocation);

  await page.waitForSelector('#txtGoEnd');
  await page.evaluate((endLocation) => {
    document.getElementById('txtGoEnd').value = endLocation;
  }, endLocation);

  // Click calendar popup
  await page.waitForSelector('[title="달력 팝업창이 뜹니다."]');
  await page.click('[title="달력 팝업창이 뜹니다."]');

  // Handle the popup window
  const pages = await browser.pages();
  const popupPage = pages[pages.length - 1];
  const dateId = process.env.DATE_ID;

  await popupPage.waitForSelector(`#${dateId}`);
  await popupPage.click(`#${dateId}`);

  // Switch back to main page
  await page.bringToFront();

  // Select departure time
  const departureTime = process.env.DEPARTURE_TIME;

  await page.waitForSelector('[title="출발일시:시"]');
  await page.click('[title="출발일시:시"]');

  await page.waitForSelector('option');
  await page.evaluate((departureTime) => {
    const options = Array.from(document.querySelectorAll('[title="출발일시:시"] option'));
    const targetOption = options.find(option => option.textContent.includes(departureTime));
    if (targetOption) {
      targetOption.selected = true;
      targetOption.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, departureTime);

  // Click ticket reservation button
  await page.waitForSelector('[alt="승차권예매"]');
  await page.click('[alt="승차권예매"]');

  // Select train type
  const trainType = process.env.TRAIN_TYPE;

  await page.waitForSelector('#selGoTrainRa00');
  await page.click('#selGoTrainRa00');

  await page.waitForSelector('option');
  await page.evaluate((trainType) => {
    const options = Array.from(document.querySelectorAll('#selGoTrainRa00 option'));
    const targetOption = options.find(option => option.textContent.includes(trainType));
    if (targetOption) {
      targetOption.selected = true;
      targetOption.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, trainType);

  // Click search button
  await page.waitForSelector('[alt="조회하기"]');
  await page.click('[alt="조회하기"]');

  // Start the retry loop
  const maxRetries = parseInt(process.env.MAX_RETRIES, 10) || 1000;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    await page.waitForSelector('#tableResult');
    const rows = await page.$$('#tableResult tr');

    let imageClicked = false;

    for (const row of rows) {
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
      await sendMail(
        process.env.EMAIL_TO,
        'Image Clicked Notification',
        'An image was clicked successfully.'
      );
      break;
    }

    await page.reload({ waitUntil: 'networkidle0' });
    retryCount += 1;
  }

  // Test completion, close the browser
  // await browser.close();
})();
