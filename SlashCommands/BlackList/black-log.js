const { SlashCommandBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName('black-log')
    .setDescription('تعيين قناة سجلات القائمة السوداء')
    .addStringOption(option =>
      option.setName('channel_id')
        .setDescription('معرف القناة المراد تعيينها')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'ليس لديك صلاحية لاستخدام هذا الأمر.', ephemeral: true });

    const channelId = interaction.options.getString('channel_id');
    const logChannel = interaction.guild.channels.cache.get(channelId);
    if (!logChannel) return interaction.reply({ content: 'معرف القناة غير صحيح.', ephemeral: true });

    db.set(`logChannelBlack_${interaction.guild.id}`, channelId);
    interaction.reply({ content: `تم تعيين قناة سجلات القائمة السوداء إلى <#${channelId}>.`, ephemeral: true });
  }
};
