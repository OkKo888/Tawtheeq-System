const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const client = require("../..");
const DB = require("../../Schema/users.js");
const { EmbedColor } = require("../../Config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("end-transfer")
    .setDescription("لانهاء عملية التحويل"),
  async execute(interaction) {
    const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
    if (blacklistCheck) {
      return interaction.reply({
        content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
        ephemeral: true,
      });
    }

    const sent = await interaction.deferReply({
      fetchReply: true,
      ephemeral: false,
    });
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
      .setTitle(`**انت لا تمتلك عملية التحويل**`);
    const User = await DB.findOne({ transfer: interaction.user.id });
    if (!User) return interaction.editReply({ embeds: [embed1] });
    //if(!db.has(`${interaction.user.id}_transfer`)) return interaction.editReply({embeds:[embed1]})
    let embed2 = new EmbedBuilder()
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
      .setTitle(`**تم انهاء عملية التحويل بنجاح**`);
    await DB.findOneAndDelete({ transfer: interaction.user.id });
    return interaction.editReply({ embeds: [embed2] });
  },
};
