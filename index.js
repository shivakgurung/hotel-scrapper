const puppeteer = require("puppeteer");
const generateCSV = require("./generateCSV");


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
  console.log("check");

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
      const link = await el.$eval("a", (a) => a.href);
      // console.log('the link', link);
      places.push(link)
      
    }
  }
  return places;
}

async function parseDetail(browser, places) {
  const ArrayOfHotelDetails = []
  let name, location, mapLocation, site, contact;
  const pageInner = await browser.newPage();
await pageInner.setViewport({ width: 1300, height: 2000 });

  for (const link of places){
  await pageInner.goto(link, { waitUntil: "networkidle2", timeout: 0 });

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
  console.log(object)
  console.log(",")
  ArrayOfHotelDetails.push(object)
  }
  
  
  // console.log(object);
  // console.log(ArrayOfHotelDetails)
  console.log('near the end of detail function');
  // console.log(ArrayOfHotelDetails);
  generateCSV(ArrayOfHotelDetails);
  return ArrayOfHotelDetails;
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
  const intervalId = setInterval(async () => {
    const newPlaces = await parsePlaces(page);
    if (newPlaces.length > places.length) {
      places = newPlaces;
      // console.log("the places", places);
    } else {
      console.log("sakiyo");
      const hotelDetailList = parseDetail(browser, places)
      console.log(hotelDetailList)
      clearInterval(intervalId); // Use the correct interval ID to stop scrolling
    }
  }, 25000);
  // await browser.close();
})();
