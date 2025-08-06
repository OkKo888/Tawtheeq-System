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
    .setName("proves")
    .setDescription("لرؤية ادلة النصاب")
    .addStringOption((Option) =>
      Option.setName("user")
        .setDescription("النصاب المراد رؤية ادلته")
        .setRequired(true)
    ), // or false
  async execute(interaction) {
    if (!owner.includes(interaction.user.id)) return;
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
      .setTitle(
        `**لم يتم العثور علي هذا الشخص في قائمة النصابين لرؤية الادلة**`
      );
    if (!db.has(`${scammer1}_scammer`))
      return interaction.reply({ embeds: [embed2] });
    // جلب بيانات النصاب
    const scammerData = db.get(`${scammer1}_data`);

    if (!scammerData) {
      const noDataEmbed = new EmbedBuilder()
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
        .setTitle(`❌ **لا توجد بيانات متوفرة**`)
        .setDescription(`لم يتم العثور على بيانات مفصلة لهذا النصاب`);

      return interaction.reply({ embeds: [noDataEmbed] });
    }

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
      .setTitle(`📋 **قصة وأدلة النصاب**`)
      .setThumbnail(scammer2.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "👤 معلومات النصاب",
          value: `**الاسم:** ${scammer2.username}\n**المعرف:** \`${scammer1}\`\n**المنشن:** <@${scammer1}>`,
          inline: false,
        },
        {
          name: "📖 قصة التهمة",
          value: scammerData.story ? `**${scammerData.story}**` : "غير متوفر",
          inline: false,
        }
      );

    // إضافة معلومات إضافية
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

    if (scammerData.addedAt) {
      embed3.addFields({
        name: "📅 تاريخ الإضافة",
        value: `\`${new Date(scammerData.addedAt).toLocaleDateString(
          "ar-EG"
        )}\``,
        inline: true,
      });
    }

    // إضافة الأدلة
    if (scammerData.proofs && scammerData.proofs.length > 0) {
      embed3.addFields({
        name: "📎 الأدلة المرفقة",
        value: `**عدد الأدلة:** ${scammerData.proofs.length}`,
        inline: false,
      });

      // إضافة روابط الأدلة
      scammerData.proofs.forEach((proof, index) => {
        embed3.addFields({
          name: `🔗 الدليل ${index + 1}`,
          value: `[${proof.name}](${proof.url})`,
          inline: true,
        });
      });
    } else {
      embed3.addFields({
        name: "📎 الأدلة",
        value: "لا توجد أدلة مرفقة",
        inline: false,
      });
    }

    interaction.reply({ embeds: [embed3] });
  },
};
