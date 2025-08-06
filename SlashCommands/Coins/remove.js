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

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("ازالة رصيد من شخص")
    .addUserOption((Option) =>
      Option.setName(`user`).setDescription(`العضو`).setRequired(true)
    )
    .addIntegerOption((Option) =>
      Option.setName(`count`).setDescription(`العدد`).setRequired(true)
    ),
  async execute(interaction, client) {
    try {
      const sent = await interaction.deferReply({ fetchReply: true });
      let user = interaction.options.getUser(`user`);
      let count = interaction.options.getInteger(`count`);
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
      const userdb = await DB.findOne({ userid: user.id });
      if (!userdb) {
        new DB({
          userid: user.id,
          balance: count * -1,
        }).save();
        embed1.setDescription(`**تم حذف ${count} من ${user} بنجاح**`);
        return interaction.editReply({ embeds: [embed1] });
      }
      let blacklist = userdb.blacklist;
      let balance = userdb.balance;
      if (blacklist == true) {
        embed1.setTitle(`**هذا العضو في القائمة السوداء**`);
        return interaction.editReply({ embeds: [embed1] });
      }
      if (count > balance) {
        embed1.setTitle(`**لا يوجد لدية هذا العدد من الرصيد**`);
        return interaction.editReply({ embeds: [embed1] });
      }
      let newbalance = Math.floor(parseInt(balance) - count);
      let newuserdb = await DB.findOneAndUpdate(
        { userid: user.id },
        { balance: newbalance }
      );
      embed1.setDescription(`**تم حذف ${count} من ${user} بنجاح**`);
      return interaction.editReply({ embeds: [embed1] });
    } catch (error) {
      return interaction.editReply({ content: `**حدث خطأ حاول مرة اخرى**` });
    }
  },
};
