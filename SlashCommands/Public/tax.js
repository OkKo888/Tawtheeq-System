const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  cooldown: 10000,
  data: new SlashCommandBuilder()
    .setName("tax")
    .setDescription("لمعرفة ضريبة رقم")
    .addStringOption((Option) =>
      Option.setName("number")
        .setDescription("العدد المراد معرفة ضريبته")
        .setRequired(true)
    ), // or false
  async execute(interaction) {
    const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
    if (blacklistCheck) {
      return interaction.reply({
        content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
        ephemeral: true,
      });
    }

    let number = interaction.options.getString(`number`);
    if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
    else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
    else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
    else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;
    let number2 = parseInt(number);
    let tax = Math.floor((number2 * 20) / 19 + 1); // المبلغ مع الضريبة
    let tax2 = Math.floor(tax - number2); // الضريبة
    let tax3 = Math.floor((tax * 20) / 19 + 1); // المبلغ مع ضريبة الوسيط
    let tax4 = Math.floor(tax3 - tax); // ضريبة الوسيط
    let embed1 = new EmbedBuilder()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor(EmbedColor)
      .addFields([
        {
          name: `**المبلغ**`,
          value: `**\`${number2}\`**`,
          inline: true,
        },
        {
          name: `**المبلغ مع الضريبة**`,
          value: `**\`${tax}\`**`,
          inline: true,
        },
        {
          name: `**المبلغ مع ضريبة الوسيط**`,
          value: `**\`${tax3}\`**`,
          inline: false,
        },
        {
          name: `**الضريبة**`,
          value: `**\`${tax2}\`**`,
          inline: true,
        },
        {
          name: `**ضريبة الوسيط**`,
          value: `**\`${tax4}\`**`,
          inline: true,
        },
      ]);
    return interaction.reply({ embeds: [embed1] });
  },
};
