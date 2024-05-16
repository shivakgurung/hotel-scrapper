const puppeteer = require('puppeteer');

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

async function parsePlaces(page) {
  let places = [];
  const elements = await page.$$('.qBF1Pd.fontHeadlineSmall');
  if (elements && elements.length) {
    for (const el of elements) {
      const name = await el.evaluate(span => span.textContent);
      places.push({ name });
    }
  }
  return places;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 2000 });
  await page.goto('https://www.google.com/maps/search/hotels+in+pokhara/@28.1428736,84.1857381,9.55z');

  // // Initial parse of places
  // let places = await parsePlaces(page);
  // console.log(places);
  let places = [];

  await autoScroll(page)
  setInterval(async () => {
   
    const newPlaces = await parsePlaces(page);
    if (newPlaces.length > places.length) {
      places = newPlaces;
      console.log(places);
    } else {
      clearInterval(5000); // Stop scrolling if no new content is loaded
    }
  }, 10000);

  // await browser.close();
})();
