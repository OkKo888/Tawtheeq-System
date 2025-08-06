const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const { EmbedColor } = require('../../Config.json');

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName('black-list')
    .setDescription('عرض جميع المستخدمين في القائمة السوداء'),
  async execute(interaction) {
    if (interaction.user.bot || interaction.channel.type === 'DM') return interaction.reply({ content: 'أوامر خاصة بالخادم فقط', ephemeral: true });

    const blacklistedUsers = db.all().filter(data => data.ID.startsWith('sccblack_'));

    if (blacklistedUsers.length === 0) {
      return interaction.reply({ content: '**لا يوجد مستخدمين في القائمة السوداء حالياً**', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('المستخدمين في القائمة السوداء')
      .setColor(EmbedColor)
      .setDescription(blacklistedUsers.map(data => `- **المستخدم:** <@${data.ID.split("_")[1]}> (المعرف: ${data.ID.split("_")[1]}) \n  **السبب:** ${db.get(data.ID).reason}`).join('\n\n'));

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};