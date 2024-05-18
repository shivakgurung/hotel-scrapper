const puppeteer = require("puppeteer");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 1000;
      const scrollInterval = 1000;

      const scrollAndCheckEnd = () => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(scrollTimer);
          resolve();
        }
      };

      const scrollTimer = setInterval(scrollAndCheckEnd, scrollInterval);
    });
  });
}

async function parseDetail(pageInner) {
  let name, location, mapLocation, site, contact;
  const nameElement = await pageInner.$(".DUwDvf.lfPIob");
  if (nameElement) {
    name = await pageInner.evaluate((el) => el.textContent, nameElement);
  } else {
    console.log("Element not found");
  }

  const nameElements = await pageInner.$$(".Io6YTe.fontBodyMedium.kR99db");
  if (nameElements.length > 0) {
    const firstFourElements = nameElements.slice(0, 4);
    for (let i = 0; i < firstFourElements.length; i++) {
      const value = await pageInner.evaluate(
        (el) => el.textContent,
        firstFourElements[i]
      );
      if (i === 0) location = value;
      else if (i === 1) site = value;
      else if (i === 2) contact = value;
      else mapLocation = value;
    }
  } else {
    console.log("No elements found with the class .DUwDvf.lfPIob");
  }

  const object = { name, location, site, contact, mapLocation };
  console.log(object);
  return object;
}

async function parsePlaces(page, browser) {
  let places = [];
  const elements = await page.$$(".Nv2PK.THOPZb.CpccDe");

  if (elements && elements.length) {
    for (const el of elements) {
      const link = await el.$eval("a", (a) => a.href);

      const pageInner = await browser.newPage();
      await pageInner.setViewport({ width: 1300, height: 2000 });
      await pageInner.goto(link, { waitUntil: "networkidle2", timeout: 0 });

      const place = await parseDetail(pageInner);
      places.push(place);
      await pageInner.close();
    }
  }
  return places;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 2000 });
  await page.goto(
    "https://www.google.com/maps/search/hotels+in+pokhara/@28.1428736,84.1857381,9.55z"
  );

  await autoScroll(page);

  let places = [];
  let newPlaces;
  const interval = setInterval(async () => {
    newPlaces = await parsePlaces(page, browser);
    if (newPlaces.length > places.length) {
      places = newPlaces;
    } else {
      clearInterval(interval);
      await browser.close();
    }
  }, 10000);
})();
