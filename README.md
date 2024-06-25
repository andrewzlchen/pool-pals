## Description

This repository contains two separate node projects that when put together, form a discord bot capable of handling common queries related to stats and schedules related to the 8-ball league at Amsterdam billiards.

## Setup

### For local development:

- Create a `local_config.json` in the root of the pool-pals repo directory with the following format:

```json
{
  "token": "<make a your own bot and use its secret token here>",
  "clientId": "1139657449717112923",
  "guildId": "<your disc server's guild ID>",
  "apiURL": "http://localhost:3000"
}
```

- The code in index.js follow the guide outlined [here](https://discordjs.guide/#before-you-begin) so I recommend you follow along and get the gist behind how the `/ping` command works before trying to implement another command.
- See the `/server` for the source code of our REST API server. This server parses a set of seed HTML files (which we'd like to get away from) to create stats that we serve over HTTP. (see `server/index.js`)

### Deploying to Prod

1. Make a copy of local_config.json and call it prod_config.json (i think the contents can just be the same thing for whatever reason. I need to figure out how to make the bot only work on the #mongods channel)
2. Download the flyctl CLI
3. Run `flyctl deploy` and Fly should handle deploying the app

## Todo

- [ ] Use file-based database (like SQLite, or others) to store schedule, player stats and standings
- [ ] Parse english dates to form javascript date objects to make queries easier (see lastUpdated and the match schedule)
- [ ] Create api routes for uploading html pages to be parsed
- [x] Parse schedule page
- [ ] Parse player stats page and use results in the /team command
- [ ] Remove /teams command (it's redundant from the /standings command)
- [ ] Automate getting up-to-date standings
