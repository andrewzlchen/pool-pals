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

      // let out = "```\n";
      // let out = "";

      const week = schedule[weekNumber - 1];

      const out = [];
      week.forEach(({ teams, time }) => {
        if (selectedTeam) {
          // only give back the matchup involving the selected team
          teams.forEach((currentTeam) => {
            if (currentTeam.toLowerCase() === selectedTeam.toLowerCase()) {
              out.push(
                `**${teams[0]}** vs. **${teams[1]}** @${time.replace("Tuesday ", "")}`,
              );
            }
          });
        } else {
          // list all matchups for the given week
          out.push(
            `**${teams[0]}** vs. **${teams[1]}** @${time.replace("Tuesday ", "")}`,
          );
        }
      });

      out.push(
        "[Team Standings](https://leagues2.amsterdambilliards.com/8ball/abc/team_standings.php?foo=bar)",
      );
      out.push(
        "[Individual Standings](https://leagues2.amsterdambilliards.com/8ball/abc/individual_standings.php?foo=bar)",
      );

      await interaction.reply(out.join("\n\n"));
    } catch (err) {
      console.error("failed to execute /schedule command", err);
      await interaction.reply(`Error running command: ${err.error}`);
    }
  },
};
