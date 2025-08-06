const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const linedb = new JsonDatabase({ databasePath: "./DataBase/AutoLine.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("autoline-set-channel")
    .setDescription("لاظافة روم خط تلقائي")
    .addChannelOption((option) =>
      option
        .setName("auto-line-channel")
        .setDescription("اختر الروم")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "🙄لا تمتلك صلاحية Administrator",
        ephemeral: true,
      });
    }

    const lineChannel = interaction.options.getChannel("auto-line-channel");

    linedb.push("autoline_rooms", lineChannel.id);
    return interaction.reply(
      `**✅ تم اظافة هذه الروم <#${lineChannel.id}> الى رومات الخط التلقائي**`
    );
  },
};
