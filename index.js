const puppeteer = require("puppeteer");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 1000; // Increase or decrease as needed for scrolling distance
      const scrollInterval = 1000; // Interval between scroll attempts

      const scrollAndCheckEnd = () => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Check if reached the bottom of the page
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(scrollTimer);
          resolve();
        }
      };

      const scrollTimer = setInterval(scrollAndCheckEnd, scrollInterval);
    });
  });
}
async function parseDetail(pageInner, browserInner){
  // console.log('inside parse function');

  const nameElements = await pageInner.$$('.Io6YTe.fontBodyMedium.kR99db');
  if (nameElements.length > 0) {
        const firstThreeElements = nameElements.slice(0, 3);
        for (const nameElement of firstThreeElements) {
          // console.log('hello')
          const value = await pageInner.evaluate(el => el.textContent, nameElement);
            console.log(value);
        }
      } else {
        console.log('No elements found with the class .DUwDvf.lfPIob');
      }

  const nameElement = await pageInner.$('.DUwDvf.lfPIob');
if (nameElement) {
  const value = await pageInner.evaluate(el => el.textContent, nameElement);
  console.log(value);
} else {
  console.log('Element not found');
}

      await browserInner.close();

}

async function parsePlaces(page) {
  // console.log("check");

  let places = [];
  // const elements = await page.$$(".qBF1Pd.fontHeadlineSmall");
  // if (elements && elements.length) {
  //   for (const el of elements) {
  //     const name = await el.evaluate((span) => span.textContent);
  //     // places.push({ name });
  //   }
  // }
  const elements = await page.$$(".Nv2PK.THOPZb.CpccDe");
  // console.log(elements);
  if (elements && elements.length) {
    for (const el of elements) {
      const link = await el.$eval("a", a => a.href);
      // console.log(link);
      const browserInner = await puppeteer.launch({ headless: false });
      const pageInner = await browserInner.newPage();
      await pageInner.setViewport({ width: 1300, height: 2000 });
      await pageInner.goto(link);
      parseDetail(pageInner, browserInner);
    }
  }
  // console.log(elements)
  return places;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 2000 });
  await page.goto(
    "https://www.google.com/maps/search/hotels+in+pokhara/@28.1428736,84.1857381,9.55z"
  );

  // // Initial parse of places
  // let places = await parsePlaces(page);
  // console.log(places);
  let places = [];

  await autoScroll(page);
  setInterval(async () => {
    const newPlaces = await parsePlaces(page);
    if (newPlaces.length > places.length) {
      places = newPlaces;
      // console.log(places);
    } else {
      clearInterval(5000); // Stop scrolling if no new content is loaded
    }
  }, 10000);

  // await browser.close();
})();
