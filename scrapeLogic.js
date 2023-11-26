const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for efficient resource usage
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://services.ecourts.gov.in/ecourtindia_v6/', { timeout: 300000 });

    await page.waitForSelector('img#captcha_image', { timeout: 50000 });
    const captchaElement = await page.$('img#captcha_image');
    await captchaElement.screenshot({ path: './uploads1/screenshot.png' });

    await page.type('input[id=cino]', 'MHAU030151912016');

    await page.goto('https://www.google.com.my/imghp');
    await page.waitForSelector('div.dRYYxd > div.nDcEnd');
    const searchButton = await page.$('div.dRYYxd > div.nDcEnd');
    await searchButton.click();
    await page.evaluate(() => {
      document.querySelector('.cB9M7').value = 'https://syedscrape4.onrender.com/img';
    });

    await Promise.all([
      page.waitForNavigation(),
      searchButton.click(),
      page.waitForSelector('#ucj-3').then((textButton) => textButton.click()),
    ]);

    await page.waitForSelector('.QeOavc');
    const textElement = await page.waitForSelector('[dir="ltr"]');
    const values = await page.evaluate((el) => el.querySelector('[dir="ltr"]').innerHTML, textElement);
    const codes = values;

    const page1 = await browser.newPage();
    await page1.goto('https://services.ecourts.gov.in/ecourtindia_v6/', { timeout: 300000 });

    await page1.waitForSelector('input#fcaptcha_code');
    await page1.type('input[id=fcaptcha_code]', codes);

    const viewButton = await page1.waitForSelector('button#searchbtn', { timeout: 300000 });
    await Promise.all([
      page1.waitForNavigation(),
      viewButton.click(),
      page1.waitForSelector('div.modal-content').then(async (bodyHandle) => {
        const html = await page1.evaluate((body) => body.innerHTML, bodyHandle);
        res.send(html);
        await bodyHandle.dispose();
      }),
    ]);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
