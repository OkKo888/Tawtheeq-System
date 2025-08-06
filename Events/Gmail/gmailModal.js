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
const { EmbedColor } = require("../../Config.json");
const DB = require("../../Schema/users.js");

const SUBMISSION_CHANNEL_ID = "1399554216523202711";

const COINS_PER_GMAIL = 10;

function createEmbed(title, description, color = EmbedColor) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

function isValidImageUrl(url) {
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
  return urlRegex.test(url);
}

function validateGmailFormat(text) {
  const cleanText = text.trim();

  const lines = cleanText.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return {
      isValid: false,
      error: "لم يتم العثور على أي جيميلات!",
      validGmails: [],
      gmailsWithoutNumbers: [],
      gmailsWithNumbers: []
    };
  }

  const validGmails = [];
  const gmailsWithoutNumbers = [];
  const gmailsWithNumbers = [];
  const invalidLines = [];

  const gmailPattern = /^[a-zA-Z]+[0-9]{2,4}@gmail\.com$/;
  const gmailWithNumbersPattern = /^[a-zA-Z]+[0-9]{1,4}@gmail\.com$/;
  const gmailWithoutNumbersPattern = /^[a-zA-Z]+@gmail\.com$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const gmailMatches = line.match(/@gmail\.com/g);
    if (!gmailMatches || gmailMatches.length !== 1) {
      invalidLines.push({
        line: i + 1,
        content: line,
        error: "يجب أن يحتوي كل سطر على جيميل واحد فقط",
      });
      continue;
    }

    if (line.includes(" ") || /[^a-zA-Z0-9@.]/.test(line)) {
      invalidLines.push({
        line: i + 1,
        content: line,
        error: "لا يسمح بالمسافات أو الرموز الخاصة",
      });
      continue;
    }

    // التحقق من الجيميلات بدون أرقام
    if (gmailWithoutNumbersPattern.test(line)) {
      validGmails.push(line);
      gmailsWithoutNumbers.push(line);
      continue;
    }

         // التحقق من الجيميلات مع أرقام (1-4 أرقام)
     if (gmailWithNumbersPattern.test(line)) {
       const parts = line.split("@");
       const localPart = parts[0];
       const nameMatch = localPart.match(/^[a-zA-Z]+/);
       const numberMatch = localPart.match(/[0-9]+$/);

       if (nameMatch && numberMatch) {
         const numbers = numberMatch[0];
         if (numbers.length >= 1 && numbers.length <= 4) {
           validGmails.push(line);
           gmailsWithNumbers.push(line);
           continue;
         }
       }
     }

    // إذا لم يطابق أي من الأنواع السابقة
    const parts = line.split("@");
    if (parts.length !== 2 || parts[1] !== "gmail.com") {
      invalidLines.push({
        line: i + 1,
        content: line,
        error: "يجب أن ينتهي بـ @gmail.com",
      });
      continue;
    }

    const localPart = parts[0];
    const nameMatch = localPart.match(/^[a-zA-Z]+/);
    const numberMatch = localPart.match(/[0-9]+$/);

    if (!nameMatch) {
      invalidLines.push({
        line: i + 1,
        content: line,
        error: "يجب أن يبدأ بحروف فقط (بدون أرقام أو رموز)",
      });
      continue;
    }

         if (!numberMatch) {
       invalidLines.push({
         line: i + 1,
         content: line,
         error: "يجب أن ينتهي بـ 1 أو 2 أو 3 أو 4 أرقام",
       });
       continue;
     }

     const numbers = numberMatch[0];
     if (numbers.length < 1 || numbers.length > 4) {
       invalidLines.push({
         line: i + 1,
         content: line,
         error: `عدد الأرقام يجب أن يكون 1 أو 2 أو 3 أو 4 فقط (موجود: ${numbers.length})`,
       });
       continue;
     }

    const expectedLength = nameMatch[0].length + numbers.length;
    if (localPart.length !== expectedLength) {
      invalidLines.push({
        line: i + 1,
        content: line,
        error: "يجب أن يحتوي على حروف + أرقام فقط (بدون رموز أخرى)",
      });
      continue;
    }
  }

  const duplicates = validGmails.filter(
    (item, index) => validGmails.indexOf(item) !== index
  );
  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: `تم العثور على جيميلات مكررة: ${duplicates.join(", ")}`,
      validGmails: [],
      gmailsWithoutNumbers: [],
      gmailsWithNumbers: []
    };
  }

  if (invalidLines.length > 0) {
    let errorMessage = "❌ **أخطاء في التنسيق:**\n\n";
    invalidLines.slice(0, 5).forEach((invalid) => {
      errorMessage += `**السطر ${invalid.line}:** \`${invalid.content}\`\n📝 ${invalid.error}\n\n`;
    });

    if (invalidLines.length > 5) {
      errorMessage += `... وهناك ${invalidLines.length - 5} أخطاء أخرى`;
    }

         errorMessage += "\n\n✅ **الصيغة الصحيحة المطلوبة:**\n";
     errorMessage += "**[اسم] + [0-4 أرقام] + @gmail.com**\n";
     errorMessage +=
       "```\njackroller@gmail.com\njohnkavin01@gmail.com\nvanisamalvin531@gmail.com\nmartin9999@gmail.com\n```";
     errorMessage += "⚠️ **ملاحظات مهمة:**\n";
     errorMessage += "• يجب أن يبدأ بحروف فقط (بدون أرقام)\n";
     errorMessage += "• يمكن أن ينتهي بـ 0 أو 1 أو 2 أو 3 أو 4 أرقام فقط\n";
     errorMessage += "• لا يسمح بالمسافات أو الرموز الخاصة\n";
     errorMessage += "• كل جيميل في سطر منفصل";

    return {
      isValid: false,
      error: errorMessage,
      validGmails: [],
      gmailsWithoutNumbers: [],
      gmailsWithNumbers: []
    };
  }

  return {
    isValid: true,
    error: null,
    validGmails: validGmails,
    gmailsWithoutNumbers: gmailsWithoutNumbers,
    gmailsWithNumbers: gmailsWithNumbers
  };
}

function countGmailAccounts(validGmails) {
  return validGmails.length;
}

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    try {
      if (
        interaction.isModalSubmit() &&
        interaction.customId === "gmail_submission_modal"
      ) {
        const gmailAccounts =
          interaction.fields.getTextInputValue("gmail_accounts");
        const proofImage = interaction.fields.getTextInputValue("proof_image");
        const additionalInfo =
          interaction.fields.getTextInputValue("additional_info") ||
          "لا توجد ملاحظات";

        const validationResult = validateGmailFormat(gmailAccounts);

        if (!validationResult.isValid) {
            await interaction.reply({
              embeds: [
                createEmbed(
                  "❌ خطأ في تنسيق الجيميلات",
                  validationResult.error,
                  "#FF6B6B"
                ),
              ],
              ephemeral: true,
            });
          return;
        }

        const gmailCount = countGmailAccounts(validationResult.validGmails);
        const totalCoins = gmailCount * COINS_PER_GMAIL;

        if (!isValidImageUrl(proofImage)) {
            await interaction.reply({
              embeds: [
                createEmbed(
                  "❌ رابط الصورة غير صحيح",
                  "تأكد من أن الرابط صحيح وينتهي بامتداد صورة (.jpg, .png, etc.)",
                  "#FF6B6B"
                ),
              ],
              ephemeral: true,
            });
          return;
        }

        const submissionChannel = interaction.client.channels.cache.get(
          SUBMISSION_CHANNEL_ID
        );

        if (!submissionChannel) {
            await interaction.reply({
              embeds: [
                createEmbed(
                  "❌ خطأ في النظام",
                  "لا يمكن العثور على قناة التسليم!",
                  "#FF6B6B"
                ),
              ],
              ephemeral: true,
            });
          return;
        }

        const formattedGmailsWithoutNumbers = validationResult.gmailsWithoutNumbers.join("\n");
        const formattedGmailsWithNumbers = validationResult.gmailsWithNumbers.join("\n");

        const submissionEmbed = createEmbed(
          "📧 طلب مراجعة حسابات جيميل",
          `تم تسليم **${gmailCount}** حساب جيميل من **${interaction.user.displayName}**\n✅ **جميع الجيميلات متوافقة مع الصيغة المطلوبة**`
        )
          .addFields(
            {
              name: "👤 المُرسِل",
              value: `${interaction.user} (${interaction.user.id})`,
              inline: true,
            },
            {
              name: "📊 العدد والمكافأة",
              value: `**${gmailCount}** جيميل\n**${totalCoins}** كوين`,
              inline: true,
            }
          );

        // إضافة field للجيميلات بدون أرقام إذا وجدت
        if (validationResult.gmailsWithoutNumbers.length > 0) {
          const withoutNumbersValue = formattedGmailsWithoutNumbers.length > 800
            ? formattedGmailsWithoutNumbers.substring(0, 800) + "..."
            : formattedGmailsWithoutNumbers;
          
          submissionEmbed.addFields({
            name: `📧 الجيميلات بدون أرقام (${validationResult.gmailsWithoutNumbers.length})`,
            value: withoutNumbersValue,
            inline: false,
          });
        }

        // إضافة field للجيميلات مع أرقام إذا وجدت
        if (validationResult.gmailsWithNumbers.length > 0) {
          const withNumbersValue = formattedGmailsWithNumbers.length > 800
            ? formattedGmailsWithNumbers.substring(0, 800) + "..."
            : formattedGmailsWithNumbers;
          
          submissionEmbed.addFields({
            name: `📧 الجيميلات مع أرقام (${validationResult.gmailsWithNumbers.length})`,
            value: withNumbersValue,
            inline: false,
          });
        }

        // إضافة field للملاحظات
        submissionEmbed.addFields({
          name: "📝 ملاحظات",
          value: additionalInfo,
          inline: false,
        })
          .setImage(proofImage)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `معرف المرسل: ${interaction.user.id} | تم التحقق من الصيغة ✅`,
          });

        const approveButton = new ButtonBuilder()
          .setCustomId(`approve_${interaction.user.id}_${gmailCount}`)
          .setLabel(`موافقة (${totalCoins} كوين)`)
          .setStyle(ButtonStyle.Success)
          .setEmoji("✅");

        const rejectButton = new ButtonBuilder()
          .setCustomId(`reject_${interaction.user.id}`)
          .setLabel("رفض")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("❌");

        const gmailsButton = new ButtonBuilder()
          .setCustomId(`show_gmails_${interaction.user.id}`)
          .setLabel("جيميلات")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("📋");

        const approvalRow = new ActionRowBuilder().addComponents(
          approveButton,
          rejectButton,
          gmailsButton
        );

        await interaction.reply({
          embeds: [
            createEmbed(
              "✅ تم التسليم بنجاح",
              `تم تسليم **${gmailCount}** حساب جيميل بنجاح\n✅ **جميع الجيميلات متوافقة مع الصيغة المطلوبة**\n\nالمكافأة المتوقعة: **${totalCoins}** كوين\n\nسيتم المراجعة قريباً`
            ),
          ],
          ephemeral: true,
        });

        await submissionChannel.send({
          embeds: [submissionEmbed],
          components: [approvalRow],
        });

        const attachment = new AttachmentBuilder("./Assets/line.png", {
          name: "line.png",
        });

        await submissionChannel.send({ files: [attachment] });
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
