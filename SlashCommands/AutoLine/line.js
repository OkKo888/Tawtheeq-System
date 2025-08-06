const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder().setName("line").setDescription("ارسال خط"),
  async execute(interaction) {
    const attachment = new AttachmentBuilder("./Assets/line.png", {
      name: "line.png",
    });
    await interaction.reply({ content: "Sent", ephemeral: true });
    await interaction.channel.send({ files: [attachment] });
  },
};
