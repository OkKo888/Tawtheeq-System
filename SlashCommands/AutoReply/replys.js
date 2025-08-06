const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const replydb = new JsonDatabase({ databasePath: "./DataBase/Replys.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("replys")
    .setDescription("اظهار جميع الردود التلقائية"),
  async execute(interaction) {
    if (interaction.user.bot) return;

    const embed = new EmbedBuilder()
      .setTitle("💬 رد تلقائي")
      .setColor("#0099ff");
    //.setFooter("`##` لحذف رد تلقائي قم بكتابة الامر /remove-reply");

    const allAutoReplies = replydb.all();
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "🙄لا تمتلك صلاحية Administrator",
        ephemeral: true,
      });

    for (const entry of allAutoReplies) {
      const { data } = entry;
      const { command, reply, replyid } = data;
      embed.addFields({
        name: `Reply ID : \`${replyid}\` || Command: ${command}`,
        value: `Reply: ${reply}`,
      });
    }

    interaction.reply({ embeds: [embed] });
  },
};
