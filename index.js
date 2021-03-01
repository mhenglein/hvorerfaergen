const express = require("express");
const axios = require("axios").default;
const cheerio = require("cheerio");

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public/"));

const PORT = process.env.PORT || 3128;
app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}...`);
});

// Constants
const selectorCoordinates =
  "body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(10) > td.v3";
const selectorSpeedCourse = `body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(9) > td.v3`;
const selectorStatus =
  "body > div.body-wrapper > div > main > div > section:nth-child(5) > div > div.column.vfix-top.npr > table > tbody > tr:nth-child(11) > td.v3.tooltip.expand";

const knotsToKm = 1.852;

// Latitude cut-offs
const latGedser = 54.574;
const latRostock = 54.149;
const latRodby = 54.65408;
const latPuttgarden = 54.503;

// URLs
const urlBerlin = `https://www.vesselfinder.com/da/vessels/BERLIN-IMO-9587855-MMSI-211727510`;
const urlCopenhagen = `https://www.vesselfinder.com/da/vessels/COPENHAGEN-IMO-9587867-MMSI-219423000`;
const urlBenedikte = `https://www.vesselfinder.com/da/vessels/PRINSESSE-BENEDIKTE-IMO-9144421-MMSI-219000431`;
const urlFrederik = "https://www.vesselfinder.com/da/vessels/KRONPRINS-FREDERIK-IMO-7803205-MMSI-211757540";
const urlSchleswig = "https://www.vesselfinder.com/da/vessels/SCHLESWIG-HOLSTEIN-IMO-9151539-MMSI-211190000";
const urlRichard = "https://www.vesselfinder.com/da/vessels/PRINS-RICHARD-IMO-9144419-MMSI-219000429";
const urlHolger = "https://www.vesselfinder.com/da/vessels/HOLGER-DANSKE-IMO-7432202-MMSI-219000737";
const urlDeutschland = "https://www.vesselfinder.com/da/vessels/DEUTSCHLAND-IMO-9151541-MMSI-211188000";

// GET request per ferry (multiple requests sent - no need for rendering, use AJAX!)
app.get("/:ferry", (req, res) => {
  const ferry = req.params.ferry;

  // Time stamp
  const currentTime = new Date();
  console.log(`[${ferry}]Received by the server at ...`, currentTime.toLocaleTimeString());

  // Get URL
  const url = getURL(ferry);
  const data = getDataFromURL(url, ferry);

  data.then((outcome) => {
    const returnJSON = {
      speed: outcome.speed,
      lat: outcome.lat,
      lon: outcome.lon,
      course: outcome.course,
      direction: outcome.direction,
      completed: outcome.completed,
      status: outcome.status,
    };

    console.log(returnJSON);
    res.json(returnJSON);

    const endTime = new Date();
    console.log("Completed by the server at ...", endTime.toLocaleTimeString());
    console.log("The operation took ...", endTime - currentTime);
  });
});

async function getDataFromURL(url, ferry) {
  return await axios
    .get(url)
    .then((response) => {
      // Get data point
      let $ = cheerio.load(response.data);
      const coordinates = $(selectorCoordinates).text(); //54.44117 N/11.96917 E
      const latitude = Number(coordinates.substring(0, 7)); //NS
      const longitude = Number(coordinates.substring(11, 18)); //ES
      const speedAndCourse = $(selectorSpeedCourse).text();
      let status = $(selectorStatus).text();
      let course = speedAndCourse.substring(0, 5);
      course = Number(course.replace("°", ""));

      const speedInKnots = speedAndCourse.substring(8, 13);
      const speedInKm = `${Math.round(speedInKnots * knotsToKm * 10) / 10} km/t`;

      let direction = "";
      let percentageCompleted = 0;

      if (status === "Under way") {
        status = "Aktiv";
      } else {
        status = "Inaktiv";
      }

      // Baseline latitude
      let latBase = 0; // e.g. Gedser or Rodby
      let latEnd = 0; // e.g. Rostock or Puttgarden
      if (ferry === "berlin" || ferry === "københavn") {
        latBase = latGedser;
        latEnd = latRostock;
      } else {
        latBase = latRodby;
        latEnd = latPuttgarden;
      }

      if (course > 270 || course < 45) {
        direction = "Nord";
      } else {
        direction = "Syd";
      }
      percentageCompleted = (latitude - latEnd) / (latBase - latEnd);
      percentageCompleted = Math.round(percentageCompleted * 100 * 10) / 10;
      percentageCompleted = percentageCompleted > 100 ? 100 : percentageCompleted;
      percentageCompleted = Math.round(percentageCompleted);

      course = course + "°";

      console.log(`Received data points from ${url}`);

      const returnObj = {
        speed: speedInKm,
        lat: latitude,
        lon: longitude,
        course: course,
        direction: direction,
        status: status,
        completed: percentageCompleted,
      };

      return returnObj;
    })
    .catch(function (e) {
      console.log(e);
    });
}

function getURL(ferryName) {
  switch (ferryName) {
    case "berlin":
      return urlBerlin;
    case "københavn":
      return urlCopenhagen;
    case "benedikte":
      return urlBenedikte;
    case "frederik":
      return urlFrederik;
    case "schleswig":
      return urlSchleswig;
    case "richard":
      return urlRichard;
    case "holger":
      return urlHolger;
    case "deutschland":
      return urlDeutschland;
    default:
      console.log("Couldn't find the appropriate fetch URL for the ferry in question");
      break;
  }
}
