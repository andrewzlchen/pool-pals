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

      const matchups = [];
      week.forEach(({ teams, time }) => {
        if (selectedTeam) {
          // only give back the matchup involving the selected team
          teams.forEach((currentTeam) => {
            if (currentTeam.toLowerCase() === selectedTeam.toLowerCase()) {
              matchups.push(
                `**${teams[0]}** vs. **${teams[1]}** @${time.replace("Tuesday ", "")}`,
              );
            }
          });
        } else {
          // list all matchups for the given week
          matchups.push(
            `**${teams[0]}** vs. **${teams[1]}** @${time.replace("Tuesday ", "")}`,
          );
        }
      });

      await interaction.reply(matchups.join("\n\n"));
    } catch (err) {
      console.error("failed to execute /schedule command", err);
      await interaction.reply(`Error running command: ${err.error}`);
    }
  },
};
