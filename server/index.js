const fs = require("node:fs/promises");

const cheerio = require("cheerio");
require("dotenv").config();

const { getStandings, parseTeams: parseTeamStats } = require("./utils");

let teamStats = undefined;

const express = require("express");
const path = require("node:path");

const main = async () => {
  try {
    // load seed html file. expect someone to upload a refreshed html file later
    const seedStandings = await fs.readFile(
      path.join(__dirname, "seed_standings.html"),
      {
        encoding: "utf8",
      }
    );
    const $ = cheerio.load(seedStandings);

    // parse the teams
    teamStats = parseTeamStats($);

    setupAPIServer();
  } catch (err) {
    console.log(err);
  }
};

const setupAPIServer = () => {
  const app = express();
  const port = 3000;

  // returns matchup of a specific team on a given week
  app.get("/schedule/:day/:team/:week", (req, res) => {
    res.send("not implemented yet");
  });

  // returns the schedule of a specific team
  app.get("/schedule/:day/:team", (req, res) => {
    res.send("not implemented yet");
  });

  // returns the entire schedule of league by the day
  app.get("/schedule/:day", (req, res) => {
    res.send("not implemented yet");
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
  app.get("/teams", (_req, res) => {
    res.json(Object.keys(teamStats));
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
    res.json(out);
  });

  // returns standings by division
  app.get("/standings/divisions/:division", async (req, res) => {
    const { division } = req.params;

    const standings = getStandings(teamStats);

    if (!standings[division]) {
      res.status(404).send(`division '${division}' not found`);
    }

    res.json(standings[division]);
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
