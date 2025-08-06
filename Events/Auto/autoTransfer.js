// const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");
// const client = require("../../index");
// const { line, guildId, probot_ids, transfer } = require("../../Config.json");

// module.exports = {
//   name: Events.MessageCreate,
/**
 * Event handler for the MessageCreate event.
 * @param {import("discord.js").Message} message The message that was created.
 * @returns {Promise<void>}
 */
//   async execute(message) {
//     // فقط في روم التحويل
//     if (message.channel.id === transfer) {
//       if (
//         (message.attachments.size > 0 &&
//           (message.content
//             .toLowerCase()
//             .includes(`type these numbers to confirm :`) ||
//            message.content
//             .toLowerCase()
//             .includes(`اكتب هذه الأرقام للتأكيد :`))) ||
//         message.author.id === client.user.id
//       )
//         return;

//       if (message.content.toLowerCase().includes("has transferred") || (message.content.toLowerCase().includes("قام بتحويل"))) {
//         const attachment = new AttachmentBuilder("./Assets/line.png", {
//           name: "line.png",
//         });
//         await message.channel.send({ files: [attachment] }).catch((err) => {
//           console.log(err.message);
//         });
//         return;
//       }

//       const validPattern = /^(#credits|#Credits|C|c)\s+(<@!?(\d+)>|\d+)\s+\d+$/;
//       if (!validPattern.test(message.content)) message.delete().catch();
//     }
//     // في حالة كانت الرسالة خارج روم التحويل
//     else {
//       const transferPattern = /^(#credits|#Credits|C|c)\s+(<@!?(\d+)>|\d+)\s+\d+$/;
//       if (transferPattern.test(message.content)) {
//         // حذف رسالة المستخدم
//         await message.delete().catch((err) => {
//           console.log("فشل في حذف رسالة التحويل:", err.message);
//         });

//         // جلب آخر 10 رسائل في القناة
//         const messages = await message.channel.messages.fetch({ limit: 10 }).catch(() => []);

//         for (const [msgId, msg] of messages) {
//           const isProbot = msg.author.id === "282859044593598464";
//           const isRecent = msg.createdTimestamp > message.createdTimestamp - 5000;

//           if (isProbot && isRecent) {
//             await msg.delete().catch((err) => {
//               console.log("فشل في حذف رد البروبوت:", err.message);
//             });
//           }

//           if (msg.author.id === client.user.id && isRecent) {
//             await msg.delete().catch((err) => {
//               console.log("فشل في حذف رد البوت:", err.message);
//             });
//           }
//         }

//         // إنشاء الإيمبد التحذيري
//         const embed = new EmbedBuilder()
//           .setDescription(`⚠️ **تحذير!**\nلا يمكن إجراء التحويل في هذه الروم.\nيرجى استخدام روم التحويل المحدد: <#${transfer}>`)
//           .setColor("#2d184d");

//         // إرسال الرد التحذيري
//         const warningMsg = await message.channel.send({ embeds: [embed] }).catch((err) => {
//           console.log("فشل في إرسال رسالة التحذير:", err.message);
//         });

//         // حذف الرسالة بعد 5 ثواني
//         if (warningMsg) {
//           setTimeout(async () => {
//             await warningMsg.delete().catch((err) => {
//               console.log("فشل في حذف رسالة التحذير:", err.message);
//             });
//           }, 5000);
//         }
//       }
//     }
//   },
// };

const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const client = require("../../index");
const { line, guildId, probot_ids, transfer } = require("../../Config.json");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.id === transfer) {
      // تجاهل إذا كانت من البوت نفسه
      if (message.author.bot) return;

      const validPattern = /^(#credits|#Credits|C|c)\s+(<@!?(\d+)>|\d+)\s+\d+$/;
      if (!validPattern.test(message.content)) return;

      // مراقبة رد بروبوت بعد رسالة المستخدم
      const filter = (msg) =>
        msg.author.id === "282859044593598464" &&
        msg.createdTimestamp > message.createdTimestamp;

      const collected = await message.channel
        .awaitMessages({
          filter,
          max: 1,
          time: 35000, // 35 ثانية انتظار
        })
        .catch(() => null);

      const reply = collected?.first();

      // إن لم يتم أي رد من بروبوت (مستبعد غالبًا)
      if (!reply) return;

      // الحالة 1: رصيد غير كافي
      if (reply.content.includes("رصيدك غير كافي لهذا")) {
        await message.delete().catch(() => {});
        await reply.delete().catch(() => {});

        const embed = new EmbedBuilder()
          .setDescription(
            `⚠️ **رصيدك غير كافي للتحويل!**\nيرجى التأكد من توفر الرصيد المطلوب.`
          )
          .setColor("#2d184d");

        const warn = await message.channel
          .send({ content: `${message.author}`, embeds: [embed] })
          .catch(() => {});
        if (warn) {
          setTimeout(() => warn.delete().catch(() => {}), 5000);
        }

        return; // لا داعي للاستمرار
      }

      // الحالة 2: كابتشا (صورة مرفقة) ولم يكتب الكود
      if (
        reply.attachments.size > 0 &&
        reply.content.includes("اكتب هذه الأرقام للتأكيد")
      ) {
        const captchaImage = reply;

        // ننتظر 30 ثانية من الآن لنرى إن كان المستخدم سيرد
        const confirmFilter = (msg) =>
          msg.author.id === message.author.id &&
          msg.createdTimestamp > reply.createdTimestamp;

        const confirmation = await message.channel
          .awaitMessages({
            filter: confirmFilter,
            max: 1,
            time: 15000, // 15 ثانية مهلة لكتابة الكابتشا
          })
          .catch(() => null);

        // لم يتم الرد بالكابتشا = إلغاء العملية
        if (!confirmation || confirmation.size === 0) {
          await message.delete().catch(() => {});
          await captchaImage.delete().catch(() => {});
          return; // لا line
        }

        // إذا تم الرد بالكابتشا، أرسل الـ line.png كالعادة
        const attachment = new AttachmentBuilder("./Assets/line.png", {
          name: "line.png",
        });

        await message.channel.send({ files: [attachment] }).catch((err) => {
          console.log(err.message);
        });

        return;
      }

      // في حالة لم يكن أي من الحالات أعلاه، نتجاهل.
      return;
    }

    // باقي الكود: الرومات الأخرى (كما هو)
    const transferPattern =
      /^(#credits|#Credits|C|c)\s+(<@!?(\d+)>|\d+)\s+\d+$/;
    if (transferPattern.test(message.content)) {
      await message.delete().catch((err) => {
        console.log("فشل في حذف رسالة التحويل:", err.message);
      });

      const messages = await message.channel.messages
        .fetch({ limit: 10 })
        .catch(() => []);
      for (const [msgId, msg] of messages) {
        const isProbot = msg.author.id === "282859044593598464";
        const isRecent = msg.createdTimestamp > message.createdTimestamp - 5000;

        if ((isProbot || msg.author.id === client.user.id) && isRecent) {
          await msg.delete().catch(() => {});
        }
      }

      const embed = new EmbedBuilder()
        .setDescription(
          `⚠️ **تحذير!**\nلا يمكن إجراء التحويل في هذه الروم.\nيرجى استخدام روم التحويل المحدد: <#${transfer}>`
        )
        .setColor("#2d184d");

      const warningMsg = await message.channel
        .send({ embeds: [embed] })
        .catch(() => {});
      if (warningMsg) {
        setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
      }
    }
  },
};
