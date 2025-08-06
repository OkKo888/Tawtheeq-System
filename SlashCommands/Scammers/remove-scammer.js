const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const client = require("../..");
const { owner, EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Scammers.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("remove-scammer")
    .setDescription("ازالة شخص من قائمة النصابين")
    .addStringOption((Option) =>
      Option.setName("scammer")
        .setDescription("ايدي النصاب المراد ازالته")
        .setRequired(true)
    ), // or false
  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) return;
    let scammer1 = interaction.options.getString(`scammer`);
    let scammer2 = await client.users.fetch(scammer1).catch();
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
      .setTitle(`**الرجاء وضع ايدي شخص صالح**`);
    if (!scammer2) return interaction.reply({ embeds: [embed1] });
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
      .setTitle(`**هذا الشخص غير موجود في قائمة النصابين**`);
    if (!db.has(`${scammer1}_scammer`))
      return interaction.reply({ embeds: [embed2] });
    // جلب بيانات النصاب قبل الحذف
    const scammerData = db.get(`${scammer1}_data`);

    // حذف جميع البيانات المرتبطة بالنصاب
    db.delete(`${scammer1}_scammer`);
    db.delete(`${scammer1}_data`);

    let embed3 = new EmbedBuilder()
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
      .setTitle(`✅ **تم إزالة النصاب بنجاح**`)
      .setDescription(`تم إزالة **${scammer2.username}** من قائمة النصابين`)
      .setThumbnail(scammer2.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "👤 النصاب المحذوف",
        value: `**الاسم:** ${scammer2.username}\n**المعرف:** \`${scammer1}\`\n**المنشن:** <@${scammer1}>`,
        inline: false,
      });

    // إضافة معلومات إضافية إذا كانت متوفرة
    if (scammerData) {
      if (scammerData.story) {
        embed3.addFields({
          name: "📖 القصة المحذوفة",
          value:
            scammerData.story.length > 1024
              ? scammerData.story.substring(0, 1021) + "..."
              : scammerData.story,
          inline: false,
        });
      }

      if (scammerData.addedAt) {
        embed3.addFields({
          name: "📅 تاريخ الإضافة الأصلية",
          value: `\`${new Date(scammerData.addedAt).toLocaleDateString(
            "ar-EG"
          )}\``,
          inline: true,
        });
      }

      if (scammerData.proofs && scammerData.proofs.length > 0) {
        embed3.addFields({
          name: "📎 الأدلة المحذوفة",
          value: `\`${scammerData.proofs.length} دليل\``,
          inline: true,
        });
      }
    }

    return interaction.reply({ embeds: [embed3] });
  },
};
