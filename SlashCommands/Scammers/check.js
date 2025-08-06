const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const client = require("../..");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Scammers.json" });
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("فحص شخص نصاب او لا")
    .addStringOption((Option) =>
      Option.setName("user")
        .setDescription("ايدي الشخص المراد فحصه")
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
    
    let scammer1 = interaction.options.getString(`user`);
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
      .setTitle(`**لم يتم العثور علي هذا الشخص في قائمة النصابين**`)
      .setDescription(`**لكن احذر هذا لا يعني انه مضمون**`);
    if (!db.has(`${scammer1}_scammer`))
      return interaction.reply({ embeds: [embed2] });
    // جلب بيانات النصاب إذا وجد
    const scammerData = db.get(`${scammer1}_data`);

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
      .setTitle(`🚨 **تم العثور على هذا الشخص في قائمة النصابين**`)
      .setDescription(`⚠️ **احذر من التعامل مع هذا الشخص** ⚠️`)
      .setThumbnail(scammer2.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "👤 معلومات النصاب",
        value: `**الاسم:** ${scammer2.username}\n**المعرف:** \`${scammer1}\`\n**المنشن:** <@${scammer1}>`,
        inline: false,
      });

    // إضافة معلومات إضافية إذا كانت متوفرة
    if (scammerData) {
      if (scammerData.story) {
        embed3.addFields({
          name: "📖 تفاصيل القضية",
          value:
            scammerData.story.length > 1024
              ? scammerData.story.substring(0, 1021) + "..."
              : scammerData.story,
          inline: false,
        });
      }

      if (scammerData.amount) {
        embed3.addFields({
          name: "💰 المبلغ المسروق",
          value: `\`${scammerData.amount}\``,
          inline: true,
        });
      }

      if (scammerData.victim) {
        embed3.addFields({
          name: "😢 الضحية",
          value: `<@${scammerData.victim}>\n\`${scammerData.victim}\``,
          inline: true,
        });
      }

      if (scammerData.proofs && scammerData.proofs.length > 0) {
        embed3.addFields({
          name: "📎 عدد الأدلة",
          value: `\`${scammerData.proofs.length} دليل\``,
          inline: true,
        });
      }

      if (scammerData.addedAt) {
        embed3.addFields({
          name: "📅 تاريخ الإضافة",
          value: `\`${new Date(scammerData.addedAt).toLocaleDateString(
            "ar-EG"
          )}\``,
          inline: true,
        });
      }
    }

    if (db.has(`${scammer1}_scammer`))
      return interaction.reply({ embeds: [embed3] });
  },
};
