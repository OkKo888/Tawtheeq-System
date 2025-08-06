const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentCollector,
  ButtonStyle,
} = require("discord.js");
const DB = require("../../Schema/users.js");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coins")
    .setDescription("معرفة رصيدك او رصيد شخص")
    .addUserOption((Option) =>
      Option.setName(`user`).setDescription(`العضو`).setRequired(false)
    ),
  async execute(interaction, client) {
    try {
      const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
      if (blacklistCheck) {
        return interaction.reply({
          content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
          ephemeral: true,
        });
      }

      const sent = await interaction.deferReply({ fetchReply: true });
      let userr = interaction.options.getUser(`user`);
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
        .setColor(EmbedColor);
      if (!userr) {
        const user = await DB.findOne({ userid: interaction.user.id });
        if (!user) {
          new DB({
            userid: interaction.user.id,
            username: interaction.user.username,
          }).save();
          embed1.setTitle(`**رصيدك هو : \`0\`**`);
          return interaction.editReply({ embeds: [embed1] });
        }
        let balance = user.balance;
        embed1.setTitle(`**رصيدك هو : \`${balance}\`**`);
        return interaction.editReply({ embeds: [embed1] });
      }
      if (userr) {
        const user = await DB.findOne({ userid: userr.id });
        if (!user) {
          new DB({
            userid: userr.id,
            username: userr.username,
          }).save();
          embed1.setDescription(`**رصيد ${userr} هو : \`0\`**`);
          return interaction.editReply({ embeds: [embed1] });
        }
        let balance = user.balance;
        embed1.setDescription(`**رصيد ${userr} هو : \`${balance}\`**`);
        return interaction.editReply({ embeds: [embed1] });
      }
    } catch (error) {
      return interaction.editReply({ content: `**حدث خطأ حاول مرة اخرى**` });
    }
  },
};
