const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require("discord.js");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("عرض صورة حساب أي مستخدم")
    .addUserOption(option =>
      option
        .setName("العضو")
        .setDescription("اختر العضو الذي تريد رؤية صورته")
        .setRequired(false)
    ),

  async execute(interaction) {
    const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
    if (blacklistCheck) {
      return interaction.reply({
        content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("العضو") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setColor(EmbedColor || 0x00AE86)
      .setAuthor({
        name: `سيرفر: ${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTitle(`🖼️ صورة الحساب الخاصة بـ: ${user.username}`)
      .setImage(avatarURL)
      .setFooter({
        text: `تم الطلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    const downloadButton = new ButtonBuilder()
      .setLabel("Avatar Link")
      .setStyle(ButtonStyle.Link)
      .setURL(avatarURL);

    const row = new ActionRowBuilder().addComponents(downloadButton);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
