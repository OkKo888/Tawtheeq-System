const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const linedb = new JsonDatabase({ databasePath: "./DataBase/AutoLine.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("autoline-channels")
    .setDescription("اظهار جميع رومات الخط التلقائي"),
  async execute(interaction) {
    const autolchannels = linedb.get("autoline_rooms");
    if (!autolchannels) {
      return interaction.reply({
        content: "لا يوجد رومات خط تلقائي",
        ephemeral: true,
      });
    }
    const autolarray = autolchannels
      .map((channel) => `<#${channel}>`)
      .join("\n");

    const autolembed = new EmbedBuilder()
      .setTitle("⚙️ auto line rooms")
      .setDescription(`**${autolarray}**`);

    await interaction.reply({ embeds: [autolembed] });
  },
};
