const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const replydb = new JsonDatabase({ databasePath: "./DataBase/Replys.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("remove-reply")
    .setDescription("لحذف رد تلقائي معين")
    .addIntegerOption((option) =>
      option
        .setName("reply-id")
        .setDescription("اكتب ايدي الرد التلقائي")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "🙄 لا تمتلك صلاحية Administrator",
        ephemeral: true,
      });
    }

    const replyId = interaction.options.getInteger("reply-id");
    if (replydb.has(`${replyId}`)) {
      replydb.delete(`${replyId}`);
      return interaction.reply(
        `**✅ تم حذف ايدي الرد \`${replyId}\` من قاعدة البيانات**`
      );
    } else {
      return interaction.reply({
        content: `🫤 ${replyId} هذا الرد غير موجود`,
        ephemeral: true,
      });
    }
  },
};
