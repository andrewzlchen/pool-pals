## Description

This repository contains two separate node projects that when put together, form a discord bot capable of handling common queries related to stats and schedules related to the 8-ball league at Amsterdam billiards.

## Todo

- [ ] Use file-based database (like SQLite, or others) to store schedule, player stats and standings
- [ ] Parse english dates to form javascript date objects to make queries easier (see lastUpdated and the match schedule)
- [ ] Create api routes for uploading html pages to be parsed
- [ ] Parse schedule page
- [ ] Parse player stats page and use results in the /team command
- [ ] Remove /teams command (it's redundant from the /standings command)
- [ ] Automate getting up-to-date standings

