const { SlashCommandBuilder } = require("discord.js");
const { table } = require("table");
const axios = require("axios");
const { apiURL } = require("../../config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("standings")
    .setDescription("Get standings for Amsterdam Billiards 8-ball Leagues")
    .addStringOption((option) =>
      option
        .setName("day")
        .setDescription("Specifies teams by the day of league play")
        .setRequired(true)
        .addChoices(
          { name: "Tuesday", value: "Tuesday" },
          { name: "Wednesday", value: "Wednesday" }
        )
    ),
  async execute(interaction) {
    const day = interaction.options.getString("day");

    try {
      const res = await axios.get(`${apiURL}/standings/days/${day}`);
      const standingsByLeagueDay = res.data;

      let out = "```\n";
      Object.keys(standingsByLeagueDay).forEach(async (division) => {
        const data = [["Rank", "Name", "Ws", "Ls", "Rack %"]];
        const teams = standingsByLeagueDay[division];
        teams.forEach((team) => {
          data.push([
            team.place,
            team.name,
            team.wins,
            team.losses,
            team.rackPercentage,
          ]);
        });
        const divisionTable = table(data, {
          header: {
            content: division,
          },
          singleLine: true,
        });
        out += `\n${divisionTable}`;
      });
      out += "```";

      await interaction.reply(out);
    } catch (err) {
      console.error("failed to execute /teams command", err);
      await interaction.reply(`Error running command: ${err.error}`);
    }
  },
};
