const fs = require("node:fs/promises");
const path = require("node:path");

const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const {
  getStandings,
  parseTeamStats,
  teamNameToID,
  parseLastUpdated,
} = require("./utils");
const { clearConfigCache } = require("prettier");

// summer 2024
const standingsURL =
  "https://leagues2.amsterdambilliards.com/8ball/abc/team_standings.php";
const scheduleURL =
  "https://leagues2.amsterdambilliards.com/8ball/abc/schedule.php?season_id=227";

let teamStats = undefined;
let lastUpdated = "";
let schedule = [];

const main = async () => {
  try {
    await fetchAndParseStandings();
  } catch (err) {
    console.log(`failed to fetch standings: ${err}`);
  }

  try {
    await fetchAndParseSchedule();
  } catch (err) {
    console.log(`failed to fetch schedule: ${err}`);
  }

  setupAPIServer();
};

const fetchAndParseStandings = async () => {
  // TODO: fetch directly from amsterdam
  const seedStandings = await fs.readFile(
    path.join(__dirname, "seedfiles/standings.html"),
    {
      encoding: "utf8",
    },
  );
  const $ = cheerio.load(seedStandings);

  // parse the teams
  teamStats = parseTeamStats($);
  lastUpdated = parseLastUpdated($);
};

const fetchAndParseSchedule = async () => {
  // TODO: fetch directly from amsterdam
  const seedSchedule = await fs.readFile(
    path.join(__dirname, "seedfiles/schedule.html"),
    {
      encoding: "utf8",
    },
  );
  const $ = cheerio.load(seedSchedule);
  schedule = parseSchedule($);
};

/**
 * parseSchedule parses the input cheerio object and returns an in-memory representation of the match schedule
 * @param {*} $: a cheerio object with the parsed html
 * @returns
 * [
 *   [
 *     {
 *        teams: [string]       //  the two teams playing
 *        time: string          //  the time of the match
 *     }
 *   ]
 * ]
 */
const parseSchedule = ($) => {
  // TODO: if last updated date is same or before last known value, then we skip parsing the doc
  const out = [];
  const weeklyMatchups = $("tr>td>table>tbody");

  weeklyMatchups.each(function (i) {
    const matchups = $(this);
    const week = [];

    console.log("there are", weeklyMatchups.length, "matchups");
    if (i === 0) {
      // ignore the first match which has a bunch of shit
      return;
    }

    matchups.find("tr").each(function (ma) {
      // parse the row
      const row = $(this).find("td");

      if (row.length !== 4) {
        return;
      }

      // this is a row displaying the matchup and the time

      const teams = [];
      let time = "";
      row.each(function (j) {
        const text = $(this).text().trim();

        switch (j) {
          case 0:
            // team 1
            teams.push(text);
          case 1:
            // ignore the '.vs'
            return;
          case 2:
            // team 2
            teams.push(text);
          case 3:
            time = text;
          default:
            // unexpected
            return;
        }
      });

      week.push({ teams, time });
      // console.log("week is now of size", week.length);
    });

    if (week.length > 0) {
      out.push(week);
    }
    console.log("out is now of size", out.length);
    // console.log(JSON.stringify(out[0], null, 2));
    // console.log("first week has", out[0].length, "matchups");
  });

  return out;
};

const setupAPIServer = () => {
  const app = express();
  const port = 3000;

  // returns all matchup on a given week
  app.get("/schedule/days/:day/weeks/:week", (req, res) => {
    res.send("not implemented yet");
  });

  // returns the schedule of a specific team
  app.get("/schedule/days/:day/teams/:team", (req, res) => {
    res.send("not implemented yet");
  });

  // returns the entire schedule of the tuesday league
  app.get("/schedule/days/tuesday", (req, res) => {
    res.json(schedule);
  });

  // returns stats of a team
  app.get("/teams/stats/:team", (req, res) => {
    const { team } = req.params;
    if (!teamStats[team]) {
      res.status(404).send(`Team '${team}' not found`);
      return;
    }

    res.json(teamStats[team]);
  });

  // returns stats of all teams
  app.get("/teams/stats", (_req, res) => {
    res.json(teamStats);
  });

  // return list of team names
  app.get("/ids", (_req, res) => {
    res.json(
      Object.keys(teamStats).map((id) => teamNameToID(teamStats[id]["name"])),
    );
  });

  // return nicely formatted list of team names by day
  app.get("/teams", (_req, res) => {
    const teams = {};
    Object.keys(teamStats).forEach((id) => {
      const team = teamStats[id];

      if (!teams[team["day"]]) {
        teams[team["day"]] = [];
      }

      teams[team["day"]].push(
        `${team["name"]} (${team["wins"]}W - ${team["losses"]}L)`,
      );
    });
    res.json(teams);
  });

  // returns standings by day
  app.get("/standings/days/:day", async (req, res) => {
    const { day } = req.params;

    const standings = getStandings(teamStats);

    const divisions = Object.keys(standings);
    const filteredDivisions = divisions.filter((division) => {
      return standings[division][0].day.toLowerCase() === day.toLowerCase();
    });

    const out = {};
    filteredDivisions.forEach((division) => {
      out[division] = standings[division];
    });
    res.json({ lastUpdated, divisions: out });
  });

  // returns standings by division
  app.get("/standings", async (_req, res) => {
    const standings = getStandings(teamStats);

    res.json(standings);
  });

  app.all("*", (_req, res) => {
    res.status(404).send("unknown request");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
