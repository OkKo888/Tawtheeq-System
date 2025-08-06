const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
} = require("discord.js");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    try {
      if (interaction.isButton() && interaction.customId === "submit_gmail") {
        const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
        if (blacklistCheck) {
          return interaction.reply({
            content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
            ephemeral: true,
          });
        }

        const gmailModal = new ModalBuilder()
          .setCustomId("gmail_submission_modal")
          .setTitle("📧 تسليم حسابات الجيميل");

        const gmailAccountsInput = new TextInputBuilder()
          .setCustomId("gmail_accounts")
          .setLabel("📧 قائمة حسابات الجيميل")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(
            "jackroller52@gmail.com\njohnkavin014@gmail.com\nvanisamalvin531@gmail.com\nmartin99@gmail.com"
          )
          .setRequired(true)
          .setMinLength(10)
          .setMaxLength(3000);

        const proofImageInput = new TextInputBuilder()
          .setCustomId("proof_image")
          .setLabel("🖼️ رابط صورة فحص الشغل")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("https://cdn.discordapp.com/attachments/...")
          .setRequired(true)
          .setMinLength(10)
          .setMaxLength(500);

        const additionalInfoInput = new TextInputBuilder()
          .setCustomId("additional_info")
          .setLabel("📝 ملاحظات إضافية (اختياري)")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("أي ملاحظات أو معلومات إضافية...")
          .setRequired(false)
          .setMaxLength(500);

        const firstRow = new ActionRowBuilder().addComponents(
          gmailAccountsInput
        );
        const secondRow = new ActionRowBuilder().addComponents(proofImageInput);
        const thirdRow = new ActionRowBuilder().addComponents(
          additionalInfoInput
        );

        gmailModal.addComponents(firstRow, secondRow, thirdRow);

        await interaction.showModal(gmailModal);
      }
    } catch (error) {
      console.error("❌ خطأ في التعامل مع التفاعل:", error);

      try {
        await interaction.reply({
          content: "❌ حدث خطأ تقني، حاول مرة أخرى.",
          ephemeral: true,
        });
      } catch (replyError) {
        console.error("خطأ في إرسال رد الخطأ:", replyError);
      }
    }
  },
};
