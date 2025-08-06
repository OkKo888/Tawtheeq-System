const { SlashCommandBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const { EmbedBuilder } = require('discord.js');
const { EmbedColor } = require('../../Config.json');

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName('black-user')
    .setDescription('التحقق من وجود مستخدم في القائمة السوداء')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('المستخدم المراد التحقق منه')
        .setRequired(true)),
  async execute(interaction) {

    const user = interaction.options.getUser('user');

    if (!user) {
      return interaction.reply({ content: '**يرجى ذكر مستخدم**', ephemeral: true });
    }
    if (user.bot) {
      return interaction.reply({ content: '**الروبوتات لا تملك قائمة سوداء**', ephemeral: true });
    }
    const blacklist = db.get(`sccblack_${user.id}.reason`);
    if (!blacklist) {
      return interaction.reply({ content: `**<@${user.id}> غير موجود في القائمة السوداء**`, ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('القائمة السوداء')
        .setTimestamp()
        .setColor(EmbedColor)
        .setDescription(`**المستخدم:** <@${user.id}>\n**السبب:** ${blacklist}`);

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
