const { SlashCommandBuilder } = require("discord.js");
const { table } = require("table");
const axios = require("axios");
const { apiURL } = require("../../config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("schedule")
    .addNumberOption((option) =>
      option
        .setName("week")
        .setDescription("Specifies the week to get the schedule for")
        .setMinValue(1)
        .setMaxValue(14) // this assumes that there are only 14 weeks
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("team")
        .setDescription("Specifies the team to get the schedule for"),
    )
    .setDescription(
      "Get schedule for the Amsterdam Billiards Tuesday 8-ball league",
    ),
  async execute(interaction) {
    const weekNumber = interaction.options.getNumber("week");
    const selectedTeam = interaction.options.getString("team");

    try {
      const res = await axios.get(`${apiURL}/schedule/days/Tuesday`);
      const schedule = res.data;

      let out = "```\n";

      const week = schedule[weekNumber - 1];

      const data = [["Team A", "Team B", "Time"]];
      week.forEach(({ teams, time }) => {
        let matchupHasSpecifiedTeam = false;
        if (selectedTeam) {
          // check if the current matchup contains the team we're interested in seeing the opponents for
          teams.forEach((currentTeam) => {
            if (currentTeam.toLowerCase() === selectedTeam.toLowerCase()) {
              matchupHasSpecifiedTeam = true;
            }
          });
        }
        if (!selectedTeam || matchupHasSpecifiedTeam) {
          data.push([teams[0], teams[1], `@${time}`]);
        }
      });

      const weeklyMatchupsTable = table(data, {
        header: { content: `Week ${weekNumber}` },
        // singleLine: true,
        drawHorizontalLine: (lineIndex, rowCount) => {
          return (
            lineIndex === 0 ||
            lineIndex === 1 ||
            lineIndex === 2 ||
            lineIndex === rowCount
          );
        },
      });

      out += `${weeklyMatchupsTable}\n`;

      out += "```";

      await interaction.reply(out);
    } catch (err) {
      console.error("failed to execute /schedule command", err);
      await interaction.reply(`Error running command: ${err.error}`);
    }
  },
};
