const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const { apiURL } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("teams")
    .setDescription(
      "Get all team registered at Amsterdam Billiards 8-ball Leagues"
    )
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
      const res = await axios.get(`${apiURL}/teams`);
      const teams = res.data[day];

      const formatted = teams.map((t) => `- ${t}`).join("\n");
      await interaction.reply(`**${day} 8 ball teams:**\n${formatted}`);
    } catch (err) {
      console.error("failed to execute /teams command", err);
      await interaction.reply("${err.error}");
    }
  },
};
