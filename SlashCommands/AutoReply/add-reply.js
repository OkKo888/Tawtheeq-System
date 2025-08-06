const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { JsonDatabase } = require("wio.db");
const replydb = new JsonDatabase({ databasePath: "./DataBase/Replys.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("add-reply")
    .setDescription("اضافة رد تلقائي")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("كلمة المفتاح للرد التلقائي")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reply")
        .setDescription("الرد التلقائي لكلمة المفتاح")
        .setRequired(true)
    ),
  async execute(interaction) {
    const word = interaction.options.getString("word");
    const reply = interaction.options.getString("reply");

    const replyID = getRandomInt(10000000, 9999999999);
    await replydb.set(`${replyID}`, {
      replyid: replyID,
      command: word,
      reply: reply,
    });

    await interaction.reply(`
        ✅ **تم اضافة الرد التلقائي**
        # الامر : \`${word}\`
        \`#\` الرد : \`${reply}\`
        `);
  },
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
