const fs = require("node:fs/promises");

// const express = require("express");
const cheerio = require("cheerio");
//
// const app = express();
// const port = 3000;
//
// app.get("/schedule", (req, res) => {
//   res.send("Hello World!");
// });
//
// app.get("/standings/:team", (req, res) => {
//   res.send("Hello World!");
// });
//
// app.get("/standings", (req, res) => {
//   res.send("Hello World!");
// });
//
// app.get("/matchup", (req, res) => {
//   res.send("Hello World!");
// });
//
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const main = async () => {
  try {
    // parse the standings
    const standings = await getStandings();

    // parse the schedule
  } catch (err) {}
};

const getStandings = async () => {
  // const out = {
  //   last_updated: "",
  //   divisions: [],
  // };
  try {
    const data = await fs.readFile("./amsterdam.html", { encoding: "utf8" });
    const $ = cheerio.load(data);

    // TODO: if last updated date is same or before last known value, then we skip parsing the doc
    // const lastUpdated = getLastUpdated($);
    // console.log(lastUpdated);

    // parse standings
    const teams = getTeams($);
  } catch (err) {
    console.error(err);
  }
};

const TABLE_ROWS = ["place", "team_name", "wins", "losses", "rack_percentage"];
const NUMERIC_TABLE_COLUMNS = new Set([
  "place",
  "wins",
  "losses",
  "rack_percentage",
]);
/** getTeams builds an array of object where each inner object has the following fields
 *
 * {
 * team_name: string    // name of the team
 * division: string     // the division of the team
 * wins: number         // number of wins
 * losses: number       // number of losses
 * rack_percentage      //  percentage of racks won
 * }
 */
const getTeams = ($) => {
  const out = [];
  const table = $("center>table>tbody");

  // each row in the table contains 2 teams:
  // the left team belongs to division[0]
  // the right team belongs to division[1]
  const divisions = ["", ""];

  // iterate over the rows of the table. i and j form coordinates in our eventual 2D
  table.find("tr").each(function (i) {
    // parse the row
    const row = $(this).find("td");

    // skip rows that contain the header rows (Place, Team Name, W's, L's, PCT.) row % 10 = 1
    // skip rows that either contain only 1 cell (which is only a &nbsp) row % 10 = 9
    if (i % 10 == 1 || i % 10 == 9 || row.length === 1) {
      return;
    }

    // if row is 2 long this is a row containing the division names
    if (row.length == 2) {
      row.each(function (j) {
        const division = $(this).text().trim();
        // filter out empty divisions which means that we've reached the last empty table
        if (division.length === 0) {
          return;
        }

        divisions[j] = division;
      });

      return;
    }

    // otherwise, this is a row containing 2 teams and their stats
    let team = {};
    row.each(function (j) {
      const dataField = $(this).text().trim();
      const field = TABLE_ROWS[j % 5];

      if (NUMERIC_TABLE_COLUMNS.has(field)) {
        team[field] = Number(dataField); // parse number from string
      } else {
        team[field] = dataField;
      }

      // this is the end of a team's stat cells
      if (j % 5 === 4) {
        // 0 means left, 1 means right
        const divisionIdx = j < 5 ? 0 : 1; // if j === [0,4], then it's the left division, otherwise it's the right
        team["division"] = divisions[divisionIdx];
        out.push(team);
        team = {};
      }
    });
  });

  return out;
};

const getLastUpdated = ($) => {
  const headerText = $("td>h3").text();
  const lastUpdatedText = headerText.split(/\n/)[1].trim();
  const cleanedDate = lastUpdatedText.slice(14, lastUpdatedText.length - 1);
  return cleanedDate;
};

main();
