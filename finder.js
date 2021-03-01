const cheerio = require("cheerio");
const open = require("open");
const axios = require("axios").default;

const selectorCoordinates = `body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(10) > td.v3`;
const selectorSpeed = `body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(9) > td.v3`;

const timerSec = 10000;

// getBerlinCoordinates();
// getCopenhagenCoordinates();
getDataPoints(urlBerlin, "BERLIN");
getDataPoints(urlCopenhagen, "KØBENHAVN");

async function getDataPoints(url, ferry) {
  try {
    let dataPoint1 = await getDataFromURL(url);
    let lat1 = dataPoint1.lat;
    let lon1 = dataPoint1.lon;
    while (dataPoint1 == undefined) {
      dataPoint1 = await getDataFromURL(url);
      lat1 = dataPoint1.lat;
      lon1 = dataPoint1.lon;
    }

    wait(5000); // Wait 5s

    let dataPoint2 = await getDataFromURL(url);
    let lat2 = dataPoint2.lat;
    let diff = lat2 - lat1;
    let speed = dataPoint2.speed;

    while (diff === 0) {
      dataPoint2 = await getDataFromURL(url);
      lat2 = dataPoint2.lat;
      diff = lat2 - lat1;
    }
    let lon2 = dataPoint2.lon;

    const direction = diff > 0 ? "N" : "S";

    const distanceLeft = getDistance(lat2, lon2, latGedser, lonGedser);
    const timeLeft = distanceLeft / speed;

    const now = new Date();

    console.log(`${now.toLocaleTimeString()} -- ${ferry} er på koordinat: LAT: ${lat2}, LON: ${lon2}. 
  Den er på vej i retning: ${direction} og sejler med ${speed.toPrecision(2)} km/t.`);

    if (lat2 > latCutoff && direction === "N") {
      open(warning);
      notifier.notify({
        title: `${ferry}`,
        subtitle: void 0,
        message: `${ferry} har krydset grænsen - ca. 5 min fra havnen`,
        icon: "dwb-logo.png",
        contentImage: "blog.png",
        sound: "ding.mp3",
        wait: true,
      });
      wait(5 * 60 * 1000);
    } else {
      getDataPoints(url, ferry);
    }
  } catch (e) {
    getDataPoints(url, ferry);
  }

  async function getDataFromURL(url) {
    return await axios
      .get(url)
      .then((response) => {
        // Get data point
        let $ = cheerio.load(response.data);
        let coordinates = $(selectorCoordinates).text(); //54.44117 N/11.96917 E
        const latitude = Number(coordinates.substring(0, 7)); //NS
        const longitude = Number(coordinates.substring(11, 18)); //ES

        let speedInKnots = Number($(selectorSpeed).text().substring(8, 13));
        let speedInKm = speedInKnots * knotsToKm;

        return { speed: speedInKm, lat: latitude, lon: longitude };
      })
      .catch(function (e) {
        console.log(e);
      });
  }
}

function getDistance(lat1, lat2, lon1, lon2) {
  const R = 6371e3; // metres

  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // in metres

  const d_km = d / 1000;
  const d_sm = d_km / 1.852;

  return d_km;
}

function wait(ms) {
  var start = Date.now(),
    now = start;
  while (now - start < ms) {
    now = Date.now();
  }
}
