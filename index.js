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

  let i=0, name, location, mapLocation, site, contact;
  const nameElement = await pageInner.$('.DUwDvf.lfPIob');
if (nameElement) {
  name = await pageInner.evaluate(el => el.textContent, nameElement);
  // console.log(name);
} else {
  console.log('Element not found');
}

  const nameElements = await pageInner.$$('.Io6YTe.fontBodyMedium.kR99db');
  if (nameElements.length > 0) {
        const firstThreeElements = nameElements.slice(0, 4);
   
        for (const nameElement of firstThreeElements) {
          const value = await pageInner.evaluate(el => el.textContent, nameElement);
          if (i == 0){
            location = value;
          }
          else if(i == 1){
            site = value;
          }
          else if(i == 2){
            contact = value;
          }
          else {
            mapLocation = value;
          }
          i++;
        }
      } else {
        console.log('No elements found with the class .DUwDvf.lfPIob');
      }
const object =  {name, location, site, contact, mapLocation}
console.log(object)

}

async function parsePlaces(page) {

  let places = [];

  const elements = await page.$$(".Nv2PK.THOPZb.CpccDe");

  if (elements && elements.length) {
    for (const el of elements) {
      const link = await el.$eval("a", a => a.href);

      const browserInner = await puppeteer.launch({ headless: false });
 


      const pageInner = await browserInner.newPage();
      await pageInner.setViewport({ width: 1300, height: 2000 });
      await pageInner.goto(link, { waitUntil: 'networkidle2', timeout: 0 }); // Ensure the page is fully loaded

      await parseDetail(pageInner, browserInner); // Await parseDetail function to ensure it completes
      await browserInner.close();
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
})();
