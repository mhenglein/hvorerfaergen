const puppeteer = require("puppeteer");
const notifier = require("node-notifier");

setInterval(checkCoordinates, 50000);

const lat = 54.5705;

function checkCoordinates() {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://www.vesselfinder.com/da/vessels/BERLIN-IMO-9587855-MMSI-211727510", { timeout: 60000 });
    const coordinatesBerlin = await page.$eval(
      "body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(10) > td.v3",
      (el) => el.textContent
    );

    const latBerlin = await Number(coordinatesBerlin.substr(0, 7));

    console.log("N Koordinat for Berlin", latBerlin);

    if (latBerlin > lat) {
      notifier.notify({
        title: "BERLIN ",
        subtitle: void 0,
        message: "Berlin har krydset grænsen - ca. 5 min fra havnen",
        icon: "dwb-logo.png",
        contentImage: "blog.png",
        sound: "ding.mp3",
        wait: true,
      });

      console.log("Berlin har krydset grænsen - ca. 5 min fra havnen");
    }

    // CPH
    await page.goto("https://www.vesselfinder.com/da/vessels/COPENHAGEN-IMO-9587867-MMSI-219423000", {
      timeout: 60000,
    });

    const coordinatesCopenhagen = await page.$eval(
      "body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(10) > td.v3",
      (el) => el.textContent
    );

    const latCopenhagen = Number(coordinatesCopenhagen.substr(0, 7));
    console.log("N Koordinat for København", latCopenhagen);

    if (latCopenhagen > lat) {
      notifier.notify({
        title: "KØBENHAVN ",
        subtitle: void 0,
        message: "København har krydset grænsen - ca. 5 min fra havnen",
        icon: "dwb-logo.png",
        contentImage: "blog.png",
        sound: "ding.mp3",
        wait: true,
      });

      console.log("København har krydset grænsen - ca. 5 min fra havnen");
    }

    browser.close();
  })();
}
