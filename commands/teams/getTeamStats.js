const { SlashCommandBuilder } = require("discord.js");
const { table } = require("table");
const axios = require("axios");
const { apiURL } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("teamstats")
    .setDescription("Get team stats")
    .addStringOption((option) =>
      option
        .setName("team")
        .setDescription(
          "The team you'd like to see stats for. Type the team name in lower case, omitting spaces"
        )
    ),
  async execute(interaction) {
    const team = interaction.options.getString("team");
    try {
      const res = await axios.get(`${apiURL}/teams/stats/${team}`);
      const teamStats = res.data;

      let out = "```\n";
      const data = [["Rank", "Ws", "Ls", "Rack %"]];
      data.push([
        teamStats.place,
        teamStats.wins,
        teamStats.losses,
        teamStats.rackPercentage,
      ]);
      const teamStatsTable = table(data, {
        header: {
          content: `${teamStats.name} Team Stats`,
        },
      });
      out += `\n${teamStatsTable}`;

      //TODO add REST parse player stats
      const playerStatsTable = table(data, {
        header: {
          content: `${teamStats.name} Player Stats (WIP)`,
        },
      });
      out += `\n${playerStatsTable}`;
      out += "```";
      await interaction.reply(out);
    } catch (err) {
      console.error("failed to execute /command", err);
      await interaction.reply(`Error running command: ${err.error}`);
    }
  },
};
