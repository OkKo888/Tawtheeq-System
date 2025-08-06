const { SlashCommandBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const { EmbedBuilder } = require('discord.js');
const { EmbedColor } = require('../../Config.json');

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName('black-remove')
    .setDescription('إزالة مستخدم من القائمة السوداء')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('المستخدم المراد إزالته من القائمة السوداء')
        .setRequired(true)),
  async execute(interaction) {

    const user = interaction.options.getUser('user');

    if (!user) {
      return interaction.reply({ content: '**يرجى ذكر مستخدم**', ephemeral: true });
    }
    if (user.bot) {
      return interaction.reply({ content: '**لا يمكنك إزالة روبوت من القائمة السوداء**', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '**لا يمكنك إزالة نفسك من القائمة السوداء!**', ephemeral: true });
    }

    const blacklist = db.get(`sccblack_${user.id}.reason`);
    if (!blacklist) {
      return interaction.reply({ content: `**<@${user.id}> غير موجود في القائمة السوداء**`, ephemeral: true });
    } else {
      db.delete(`sccblack_${user.id}`);
      const embed = new EmbedBuilder()
        .setColor(EmbedColor)
        .setTitle('القائمة السوداء - تم إزالة مستخدم')
        .setDescription(`**المستخدم:** <@${user.id}>\n**تمت الإزالة بواسطة:** <@${interaction.user.id}>\n**الخادم:** ${interaction.guild.name}`)
        .setTimestamp();

      const logChannelId = db.get(`logChannelBlack_${interaction.guild.id}`);
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [embed] });
      }
      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
