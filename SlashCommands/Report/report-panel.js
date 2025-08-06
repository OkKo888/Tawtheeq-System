const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("../../Config.json");

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("report-panel")
    .setDescription("Order Panel"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor(config.EmbedColor)
      .setTitle(`**Report Panel**`)
      .setDescription(`\`-\` **للتبليغ عن اي شئ او اي مشكلة رجاء اضغط الزر ادناه لعمل بلاغ**`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create-report")
        .setLabel("تبليغ")
        .setEmoji("🚨")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "Sent", ephemeral: true });
  },
};
