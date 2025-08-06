const { SlashCommandBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const { EmbedBuilder } = require('discord.js');
const { EmbedColor } = require('../../Config.json');

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName('black-add')
    .setDescription('إضافة مستخدم إلى القائمة السوداء')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('المستخدم المراد إضافته للقائمة السوداء')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('سبب إضافة المستخدم للقائمة السوداء')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (!user) {
      return interaction.reply({ content: '**يرجى ذكر مستخدم**', ephemeral: true });
    }
    if (user.bot) {
      return interaction.reply({ content: '**لا يمكنك إضافة روبوت للقائمة السوداء**', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '**لا يمكنك إضافة نفسك للقائمة السوداء!**', ephemeral: true });
    }

    const blacklist = db.get(`sccblack_${user.id}`);
    if (blacklist) {
      return interaction.reply({ content: `**المستخدم <@${user.id}> موجود بالفعل في القائمة السوداء**`, ephemeral: true });
    }
    if (!reason) {
      return interaction.reply({ content: '**يرجى تقديم سبب للإضافة**', ephemeral: true });
    }
    db.set(`sccblack_${user.id}`, { reason: reason });
    const embed = new EmbedBuilder()
      .setColor(EmbedColor)
      .setTitle('القائمة السوداء - تم إضافة مستخدم')
      .setDescription(`**المستخدم:** <@${user.id}>\n**السبب:** ${reason}\n**تمت الإضافة بواسطة:** <@${interaction.user.id}>\n**الخادم:** ${interaction.guild.name}`)
      .setTimestamp();

    const logChannelId = db.get(`logChannelBlack_${interaction.guild.id}`);
    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      logChannel.send({ embeds: [embed] });
    }
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
