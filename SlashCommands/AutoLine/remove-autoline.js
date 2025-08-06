const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const linedb = new JsonDatabase({ databasePath: "./DataBase/AutoLine.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("autoline-remove-channel")
    .setDescription("حذف روم خط تلقائي")
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
    const autolineRooms = linedb.get("autoline_rooms");

    if (autolineRooms.includes(lineChannel.id)) {
      const filtered = autolineRooms.filter(
        (roomId) => roomId !== lineChannel.id
      );
      linedb.set("autoline_rooms", filtered);
      return interaction.reply(
        `**✅ تم حذف الروم <#${lineChannel.id}> من قاعدة البيانات**`
      );
    } else {
      return interaction.reply({
        content: `🫤 <#${lineChannel.id}> هذه الروم ليست روم خط تلقائي`,
        ephemeral: true,
      });
    }
  },
};
