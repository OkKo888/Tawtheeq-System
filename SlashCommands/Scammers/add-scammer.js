// const {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   PermissionsBitField,
//   MessageAttachment,
// } = require("discord.js");
// const client = require("../..");
// const { owner, EmbedColor } = require("../../Config.json");
// const { JsonDatabase } = require("wio.db");
// const db = new JsonDatabase({ databasePath: "./DataBase/Scammers.json" });

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("add-scammer")
//     .setDescription("اضافة نصاب")
//     .addStringOption((Option) =>
//       Option.setName("scammer")
//         .setDescription("ايدي الشخص النصاب")
//         .setRequired(true)
//     )
//     .addStringOption((Option) =>
//       Option.setName(`story`).setDescription(`قصة النصاب`).setRequired(true)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove1`).setDescription(`الدليل الاول`).setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove2`)
//         .setDescription(`الدليل الثاني`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove3`)
//         .setDescription(`الدليل الثالث`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove4`)
//         .setDescription(`الدليل الرابع`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove5`)
//         .setDescription(`الدليل الخامس`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove6`)
//         .setDescription(`الدليل السادس`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove7`)
//         .setDescription(`الدليل السابع`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove8`)
//         .setDescription(`الدليل الثامن`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove9`)
//         .setDescription(`الدليل التاسع`)
//         .setRequired(false)
//     )
//     .addAttachmentOption((Option) =>
//       Option.setName(`prove10`)
//         .setDescription(`الدليل العاشر`)
//         .setRequired(false)
//     ), // or false
//   async execute(interaction) {
//     if (!owner.includes(interaction.user.id)) return;
//     let scammer1 = interaction.options.getString(`scammer`);
//     let scammer2 = await client.users.fetch(scammer1).catch();
//     let embed1 = new EmbedBuilder()
//       .setFooter({
//         text: interaction.user.username,
//         iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
//       })
//       .setAuthor({
//         name: interaction.guild.name,
//         iconURL: interaction.guild.iconURL({ dynamic: true }),
//       })
//       .setTimestamp(Date.now())
//       .setColor(EmbedColor)
//       .setTitle(`**الرجاء وضع ايدي شخص صالح**`);
//     if (!scammer2) return interaction.reply({ embeds: [embed1] });
//     let story = interaction.options.getString(`story`);
//     let prove1 = interaction.options.getAttachment(`prove1`);
//     let prove2 = interaction.options.getAttachment(`prove2`);
//     let prove3 = interaction.options.getAttachment(`prove3`);
//     let prove4 = interaction.options.getAttachment(`prove4`);
//     let prove5 = interaction.options.getAttachment(`prove5`);
//     let prove6 = interaction.options.getAttachment(`prove6`);
//     let prove7 = interaction.options.getAttachment(`prove7`);
//     let prove8 = interaction.options.getAttachment(`prove8`);
//     let prove9 = interaction.options.getAttachment(`prove9`);
//     let prove10 = interaction.options.getAttachment(`prove10`);
//     let proves = [];
//     if (prove1) proves.push(prove1.proxyURL);
//     if (prove2) proves.push(prove2.proxyURL);
//     if (prove3) proves.push(prove3.proxyURL);
//     if (prove4) proves.push(prove4.proxyURL);
//     if (prove5) proves.push(prove5.proxyURL);
//     if (prove6) proves.push(prove6.proxyURL);
//     if (prove7) proves.push(prove7.proxyURL);
//     if (prove8) proves.push(prove8.proxyURL);
//     if (prove9) proves.push(prove9.proxyURL);
//     if (prove10) proves.push(prove10.proxyURL);
//     let embed2 = new EmbedBuilder()
//       .setFooter({
//         text: interaction.user.username,
//         iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
//       })
//       .setAuthor({
//         name: interaction.guild.name,
//         iconURL: interaction.guild.iconURL({ dynamic: true }),
//       })
//       .setTimestamp(Date.now())
//       .setColor(EmbedColor)
//       .setTitle(`**هذا الشخص موجود في قائمة النصابين بالفعل**`);
//     if (db.has(`${scammer1}_scammer`))
//       return interaction.reply({ embeds: [embed2] });
//     let embed3 = new EmbedBuilder()
//       .setFooter({
//         text: interaction.user.username,
//         iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
//       })
//       .setAuthor({
//         name: interaction.guild.name,
//         iconURL: interaction.guild.iconURL({ dynamic: true }),
//       })
//       .setTimestamp(Date.now())
//       .setColor(EmbedColor)
//       .setTitle(`**تم اضافة المتهم الي قائمة النصابين بنجاح**`)
//       .addFields(
//         {
//           name: `**المتهم**`,
//           value: `**<@${scammer1}>**`,
//           inline: true,
//         },
//         {
//           name: `**القصة**`,
//           value: `**${story}**`,
//           inline: true,
//         },
//         {
//           name: `**الادلة**`,
//           value: `** الادلة علي هيئة روابط**`,
//           inline: true,
//         }
//       );
//     proves.forEach((provee) => {
//       embed3.addFields({ name: `**===**`, value: `${provee}`, inline: false });
//     });
//     db.set(`${scammer1}_scammer`, true);
//     db.set(`${scammer1}_story`, story);
//     db.set(`${scammer1}_proves`, proves);
//     interaction.reply({ embeds: [embed3] });
//   },
// };

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  MessageAttachment,
  AttachmentBuilder,
} = require("discord.js");
const client = require("../..");
const { owner, scammers, EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Scammers.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("add-scammer")
    .setDescription("اضافة نصاب جديد الى قاعدة البيانات")
    .addStringOption((option) =>
      option
        .setName("scammer")
        .setDescription("معرف الشخص النصاب (User ID)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("story")
        .setDescription("قصة النصب وتفاصيل الحادثة")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("victim")
        .setDescription("معرف الضحية (اختياري)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("المبلغ المسروق (اختياري)")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("prove1").setDescription("الدليل الأول").setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove2")
        .setDescription("الدليل الثاني")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove3")
        .setDescription("الدليل الثالث")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove4")
        .setDescription("الدليل الرابع")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove5")
        .setDescription("الدليل الخامس")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove6")
        .setDescription("الدليل السادس")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove7")
        .setDescription("الدليل السابع")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove8")
        .setDescription("الدليل الثامن")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove9")
        .setDescription("الدليل التاسع")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prove10")
        .setDescription("الدليل العاشر")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      // التحقق من الصلاحيات
      if (!owner.includes(interaction.user.id)) {
        const noPermissionEmbed = new EmbedBuilder()
          .setColor(EmbedColor)
          .setTitle("❌ ليس لديك صلاحية لاستخدام هذا الأمر")
          .setDescription("هذا الأمر متاح فقط لمطوري البوت")
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return interaction.reply({
          embeds: [noPermissionEmbed],
          ephemeral: true,
        });
      }

      // جلب البيانات
      const scammerId = interaction.options.getString("scammer");
      const story = interaction.options.getString("story");
      const victimId = interaction.options.getString("victim");
      const amount = interaction.options.getString("amount");

      // التحقق من صحة معرف النصاب
      let scammerUser;
      try {
        scammerUser = await client.users.fetch(scammerId);
      } catch (error) {
        const invalidUserEmbed = new EmbedBuilder()
          .setColor(EmbedColor)
          .setTitle("❌ معرف غير صحيح")
          .setDescription("الرجاء التأكد من صحة معرف المستخدم")
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [invalidUserEmbed] });
      }

      // التحقق من وجود النصاب في قاعدة البيانات
      if (db.has(`${scammerId}_scammer`)) {
        const alreadyExistsEmbed = new EmbedBuilder()
          .setColor(EmbedColor)
          .setTitle("⚠️ المستخدم موجود بالفعل")
          .setDescription(
            `**${scammerUser.username}** موجود في قائمة النصابين بالفعل`
          )
          .setThumbnail(scammerUser.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        return interaction.reply({ embeds: [alreadyExistsEmbed] });
      }

      // جمع الأدلة
      const proofs = [];
      for (let i = 1; i <= 10; i++) {
        const proof = interaction.options.getAttachment(`prove${i}`);
        if (proof) {
          proofs.push({
            name: proof.name,
            url: proof.url,
            proxyURL: proof.proxyURL,
            contentType: proof.contentType,
          });
        }
      }

      // حفظ البيانات في قاعدة البيانات
      const scammerData = {
        id: scammerId,
        username: scammerUser.username,
        discriminator: scammerUser.discriminator,
        story: story,
        victim: victimId || null,
        amount: amount || null,
        proofs: proofs,
        addedBy: interaction.user.id,
        addedAt: new Date().toISOString(),
        guildId: interaction.guild.id,
      };

      db.set(`${scammerId}_scammer`, true);
      db.set(`${scammerId}_data`, scammerData);

      // إنشاء embed للرد على المستخدم
      const successEmbed = new EmbedBuilder()
        .setColor(EmbedColor)
        .setTitle("✅ تم إضافة النصاب بنجاح")
        .setDescription(
          `تم إضافة **${scammerUser.username}** إلى قائمة النصابين`
        )
        .addFields(
          {
            name: "👤 المتهم",
            value: `<@${scammerId}>\n\`${scammerId}\``,
            inline: true,
          },
          {
            name: "📖 القصة",
            value:
              story.length > 1024 ? story.substring(0, 1021) + "..." : story,
            inline: false,
          },
          {
            name: "💰 المبلغ المسروق",
            value: amount ? `\`${amount}\`` : "غير محدد",
            inline: true,
          },
          {
            name: "👥 الضحية",
            value: victimId ? `<@${victimId}>\n\`${victimId}\`` : "غير محدد",
            inline: true,
          },
          {
            name: "📎 عدد الأدلة",
            value: `\`${proofs.length} دليل\``,
            inline: true,
          }
        )
        .setThumbnail(scammerUser.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `أضيف بواسطة ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      if (victimId) {
        try {
          const victimUser = await client.users.fetch(victimId);
          successEmbed.addFields({
            name: "😢 الضحية",
            value: `<@${victimId}>\n\`${victimId}\``,
            inline: true,
          });
        } catch (error) {
          successEmbed.addFields({
            name: "😢 الضحية",
            value: `\`${victimId}\``,
            inline: true,
          });
        }
      }

      if (amount) {
        successEmbed.addFields({
          name: "💰 المبلغ",
          value: amount,
          inline: true,
        });
      }

      if (proofs.length > 0) {
        successEmbed.addFields({
          name: "📋 عدد الأدلة",
          value: `${proofs.length} دليل`,
          inline: true,
        });
      }

      // الرد على المستخدم
      await interaction.reply({ embeds: [successEmbed] });

      // إرسال التفاصيل في الروم المخصصة
      try {
        const exposeChannel = await client.channels.fetch(scammers);

        if (exposeChannel) {
          // إنشاء embed مفصل للروم
          const exposeEmbed = new EmbedBuilder()
            .setColor(EmbedColor)
            .setTitle("🚨 تم إضافة نصاب جديد")
            .setDescription(`⚠️ **تحذير من هذا المستخدم** ⚠️`)
            .addFields(
              {
                name: "👤 معلومات النصاب",
                value: `**الاسم:** ${scammerUser.username}#${scammerUser.discriminator}\n**المعرف:** \`${scammerId}\`\n**المنشن:** <@${scammerId}>`,
                inline: false,
              },
              {
                name: "📖 تفاصيل القضية",
                value: story,
                inline: false,
              }
            )
            .setThumbnail(scammerUser.displayAvatarURL({ dynamic: true }))
            .setFooter({
              text: `تم الإبلاغ بواسطة ${interaction.user.username} • ${interaction.guild.name}`,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          if (victimId) {
            try {
              const victimUser = await client.users.fetch(victimId);
              exposeEmbed.addFields({
                name: "😢 الضحية المبلغة",
                value: `**${victimUser.username}#${victimUser.discriminator}**\n\`${victimId}\``,
                inline: true,
              });
            } catch (error) {
              exposeEmbed.addFields({
                name: "😢 الضحية المبلغة",
                value: `\`${victimId}\``,
                inline: true,
              });
            }
          }

          if (amount) {
            exposeEmbed.addFields({
              name: "💰 المبلغ المسروق",
              value: amount,
              inline: true,
            });
          }

          // إرسال الـ embed الرئيسي
          await exposeChannel.send({
            content: `@here`,
            embeds: [exposeEmbed],
          });

          // إرسال الأدلة إذا كانت موجودة
          if (proofs.length > 0) {
            const proofsEmbed = new EmbedBuilder()
              .setColor(EmbedColor)
              .setTitle("📋 الأدلة المرفقة")
              .setDescription(`**عدد الأدلة:** ${proofs.length}`)
              .setFooter({
                text: `القضية: ${scammerUser.username}`,
                iconURL: scammerUser.displayAvatarURL({ dynamic: true }),
              });

            // إضافة روابط الأدلة
            proofs.forEach((proof, index) => {
              proofsEmbed.addFields({
                name: `🔗 الدليل ${index + 1}`,
                value: `[${proof.name}](${proof.url})`,
                inline: true,
              });
            });

            await exposeChannel.send({ embeds: [proofsEmbed] });

            // إرسال الصور مباشرة إذا كانت صور
            for (const proof of proofs) {
              if (proof.contentType && proof.contentType.startsWith("image/")) {
                try {
                  await exposeChannel.send({
                    content: `**📸 دليل:** ${proof.name}`,
                    files: [proof.url],
                  });
                } catch (error) {
                  console.log(`فشل في إرسال الصورة: ${proof.name}`);
                }
              }
            }
          }

          const attachment = new AttachmentBuilder("./Assets/line.png", {
            name: "line.png",
          });
          await exposeChannel.send({ files: [attachment] });
        } else {
          console.log("لم يتم العثور على الروم المخصصة لفضح النصابين");
        }
      } catch (error) {
        console.log("خطأ في إرسال الرسالة للروم المخصصة:", error);
      }
    } catch (error) {
      console.error("خطأ في تنفيذ الأمر:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(EmbedColor)
        .setTitle("❌ حدث خطأ")
        .setDescription("حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى.")
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
