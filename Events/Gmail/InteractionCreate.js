// const {
//   Events,
//   EmbedBuilder,
//   ActionRowBuilder,
//   ButtonBuilder,
//   ButtonStyle,
//   ModalBuilder,
//   TextInputBuilder,
//   TextInputStyle,
//   AttachmentBuilder
// } = require("discord.js");
// const { EmbedColor } = require("../../Config.json");
// const DB = require("../../Schema/users.js");

// // معرفات القنوات
// const SUBMISSION_CHANNEL_ID = "1399554216523202711";

// // سعر الجيميل الواحد (كوينز)
// const COINS_PER_GMAIL = 10;

// // دالة مساعدة لإنشاء embed موحد
// function createEmbed(title, description, color = EmbedColor) {
//   return new EmbedBuilder()
//     .setTitle(title)
//     .setDescription(description)
//     .setColor(color)
//     .setTimestamp();
// }

// // دالة للتحقق من صحة رابط الصورة
// function isValidImageUrl(url) {
//   const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
//   return urlRegex.test(url);
// }

// // دالة التحقق الذكية من تنسيق الجيميلات
// function validateGmailFormat(text) {
//   // إزالة المسافات الزائدة والأسطر الفارغة
//   const cleanText = text.trim();

//   // تقسيم النص إلى أسطر
//   const lines = cleanText.split("\n").filter((line) => line.trim() !== "");

//   if (lines.length === 0) {
//     return {
//       isValid: false,
//       error: "لم يتم العثور على أي جيميلات!",
//       validGmails: [],
//     };
//   }

//   const validGmails = [];
//   const invalidLines = [];

//   // نمط التحقق الدقيق: اسم (حروف فقط) + 2 أو 3 أرقام + @gmail.com
//   const gmailPattern = /^[a-zA-Z]+[0-9]{2,3}@gmail\.com$/;

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();

//     // التحقق من أن السطر يحتوي على جيميل واحد فقط
//     const gmailMatches = line.match(/@gmail\.com/g);
//     if (!gmailMatches || gmailMatches.length !== 1) {
//       invalidLines.push({
//         line: i + 1,
//         content: line,
//         error: "يجب أن يحتوي كل سطر على جيميل واحد فقط",
//       });
//       continue;
//     }

//     // التحقق من عدم وجود مسافات أو رموز خاصة
//     if (line.includes(" ") || /[^a-zA-Z0-9@.]/.test(line)) {
//       invalidLines.push({
//         line: i + 1,
//         content: line,
//         error: "لا يسمح بالمسافات أو الرموز الخاصة",
//       });
//       continue;
//     }

//     // التحقق من الصيغة المطلوبة بدقة
//     if (!gmailPattern.test(line)) {
//       // تحليل أكثر تفصيلاً لمعرفة سبب الخطأ
//       const parts = line.split("@");
//       if (parts.length !== 2 || parts[1] !== "gmail.com") {
//         invalidLines.push({
//           line: i + 1,
//           content: line,
//           error: "يجب أن ينتهي بـ @gmail.com",
//         });
//         continue;
//       }

//       const localPart = parts[0]; // الجزء قبل @
//       const nameMatch = localPart.match(/^[a-zA-Z]+/);
//       const numberMatch = localPart.match(/[0-9]+$/);

//       if (!nameMatch) {
//         invalidLines.push({
//           line: i + 1,
//           content: line,
//           error: "يجب أن يبدأ بحروف فقط (بدون أرقام أو رموز)",
//         });
//         continue;
//       }

//       if (!numberMatch) {
//         invalidLines.push({
//           line: i + 1,
//           content: line,
//           error: "يجب أن ينتهي بـ 2 أو 3 أرقام",
//         });
//         continue;
//       }

//       const numbers = numberMatch[0];
//       if (numbers.length < 2 || numbers.length > 3) {
//         invalidLines.push({
//           line: i + 1,
//           content: line,
//           error: `عدد الأرقام يجب أن يكون 2 أو 3 فقط (موجود: ${numbers.length})`,
//         });
//         continue;
//       }

//       // إذا وصلنا هنا، فهناك رموز أخرى في المنتصف
//       const expectedLength = nameMatch[0].length + numbers.length;
//       if (localPart.length !== expectedLength) {
//         invalidLines.push({
//           line: i + 1,
//           content: line,
//           error: "يجب أن يحتوي على حروف + أرقام فقط (بدون رموز أخرى)",
//         });
//         continue;
//       }
//     }

//     validGmails.push(line);
//   }

//   // التحقق من وجود جيميلات مكررة
//   const duplicates = validGmails.filter(
//     (item, index) => validGmails.indexOf(item) !== index
//   );
//   if (duplicates.length > 0) {
//     return {
//       isValid: false,
//       error: `تم العثور على جيميلات مكررة: ${duplicates.join(", ")}`,
//       validGmails: [],
//     };
//   }

//   if (invalidLines.length > 0) {
//     let errorMessage = "❌ **أخطاء في التنسيق:**\n\n";
//     invalidLines.slice(0, 5).forEach((invalid) => {
//       errorMessage += `**السطر ${invalid.line}:** \`${invalid.content}\`\n📝 ${invalid.error}\n\n`;
//     });

//     if (invalidLines.length > 5) {
//       errorMessage += `... وهناك ${invalidLines.length - 5} أخطاء أخرى`;
//     }

//     errorMessage += "\n\n✅ **الصيغة الصحيحة المطلوبة:**\n";
//     errorMessage += "**[اسم] + [2 أو 3 أرقام] + @gmail.com**\n";
//     errorMessage +=
//       "```\njackroller52@gmail.com\njohnkavin014@gmail.com\nvanisamalvin531@gmail.com\nmartin99@gmail.com\n```";
//     errorMessage += "⚠️ **ملاحظات مهمة:**\n";
//     errorMessage += "• يجب أن يبدأ بحروف فقط (بدون أرقام)\n";
//     errorMessage += "• يجب أن ينتهي بـ 2 أو 3 أرقام فقط\n";
//     errorMessage += "• لا يسمح بالمسافات أو الرموز الخاصة\n";
//     errorMessage += "• كل جيميل في سطر منفصل";

//     return {
//       isValid: false,
//       error: errorMessage,
//       validGmails: [],
//     };
//   }

//   return {
//     isValid: true,
//     error: null,
//     validGmails: validGmails,
//   };
// }

// // دالة لحساب عدد الجيميلات من القائمة المتحققة
// function countGmailAccounts(validGmails) {
//   return validGmails.length;
// }

// module.exports = {
//   name: Events.InteractionCreate,
//   execute: async (interaction) => {
//     try {
//       if (interaction.isButton() && interaction.customId === "submit_gmail") {
//         await handleGmailSubmissionButton(interaction);
//       }

//       if (
//         interaction.isModalSubmit() &&
//         interaction.customId === "gmail_submission_modal"
//       ) {
//         await handleGmailSubmissionModal(interaction);
//       }

//       if (
//         interaction.isButton() &&
//         (interaction.customId.startsWith("approve_") ||
//           interaction.customId.startsWith("reject_"))
//       ) {
//         await handleApprovalButtons(interaction);
//       }

//       if (
//         interaction.isModalSubmit() &&
//         interaction.customId.startsWith("reject_reason_")
//       ) {
//         await handleRejectionModal(interaction);
//       }
//     } catch (error) {
//       console.error("❌ خطأ في التعامل مع التفاعل:", error);

//       if (!interaction.replied && !interaction.deferred) {
//         try {
//           await interaction.reply({
//             content: "❌ حدث خطأ تقني، حاول مرة أخرى.",
//             ephemeral: true,
//           });
//         } catch (replyError) {
//           console.error("خطأ في إرسال رد الخطأ:", replyError);
//         }
//       }
//     }
//   },
// };

// // دالة معالجة ضغط زر التسليم
// async function handleGmailSubmissionButton(interaction) {
//   const gmailModal = new ModalBuilder()
//     .setCustomId("gmail_submission_modal")
//     .setTitle("📧 تسليم حسابات الجيميل");

//   const gmailAccountsInput = new TextInputBuilder()
//     .setCustomId("gmail_accounts")
//     .setLabel("📧 قائمة حسابات الجيميل")
//     .setStyle(TextInputStyle.Paragraph)
//     .setPlaceholder(
//       "jackroller52@gmail.com\njohnkavin014@gmail.com\nvanisamalvin531@gmail.com\nmartin99@gmail.com"
//     )
//     .setRequired(true)
//     .setMinLength(10)
//     .setMaxLength(3000);

//   const proofImageInput = new TextInputBuilder()
//     .setCustomId("proof_image")
//     .setLabel("🖼️ رابط صورة فحص الشغل")
//     .setStyle(TextInputStyle.Short)
//     .setPlaceholder("https://cdn.discordapp.com/attachments/...")
//     .setRequired(true)
//     .setMinLength(10)
//     .setMaxLength(500);

//   const additionalInfoInput = new TextInputBuilder()
//     .setCustomId("additional_info")
//     .setLabel("📝 ملاحظات إضافية (اختياري)")
//     .setStyle(TextInputStyle.Paragraph)
//     .setPlaceholder("أي ملاحظات أو معلومات إضافية...")
//     .setRequired(false)
//     .setMaxLength(500);

//   const firstRow = new ActionRowBuilder().addComponents(gmailAccountsInput);
//   const secondRow = new ActionRowBuilder().addComponents(proofImageInput);
//   const thirdRow = new ActionRowBuilder().addComponents(additionalInfoInput);

//   gmailModal.addComponents(firstRow, secondRow, thirdRow);

//   await interaction.showModal(gmailModal);
// }

// // دالة معالجة تسليم نموذج الجيميل
// async function handleGmailSubmissionModal(interaction) {
//   const gmailAccounts = interaction.fields.getTextInputValue("gmail_accounts");
//   const proofImage = interaction.fields.getTextInputValue("proof_image");
//   const additionalInfo =
//     interaction.fields.getTextInputValue("additional_info") ||
//     "لا توجد ملاحظات";

//   // التحقق الذكي من تنسيق الجيميلات
//   const validationResult = validateGmailFormat(gmailAccounts);

//   if (!validationResult.isValid) {
//     await interaction.reply({
//       embeds: [
//         createEmbed(
//           "❌ خطأ في تنسيق الجيميلات",
//           validationResult.error,
//           "#FF6B6B"
//         ),
//       ],
//       ephemeral: true,
//     });
//     return;
//   }

//   // حساب عدد الجيميلات الصحيحة
//   const gmailCount = countGmailAccounts(validationResult.validGmails);
//   const totalCoins = gmailCount * COINS_PER_GMAIL;

//   if (!isValidImageUrl(proofImage)) {
//     await interaction.reply({
//       embeds: [
//         createEmbed(
//           "❌ رابط الصورة غير صحيح",
//           "تأكد من أن الرابط صحيح وينتهي بامتداد صورة (.jpg, .png, etc.)",
//           "#FF6B6B"
//         ),
//       ],
//       ephemeral: true,
//     });
//     return;
//   }

//   const submissionChannel = interaction.client.channels.cache.get(
//     SUBMISSION_CHANNEL_ID
//   );

//   if (!submissionChannel) {
//     await interaction.reply({
//       embeds: [
//         createEmbed(
//           "❌ خطأ في النظام",
//           "لا يمكن العثور على قناة التسليم!",
//           "#FF6B6B"
//         ),
//       ],
//       ephemeral: true,
//     });
//     return;
//   }

//   // تنسيق الجيميلات المعتمدة للعرض
//   const formattedGmails = validationResult.validGmails.join("\n");

//   // إنشاء Embed للتسليم
//   const submissionEmbed = createEmbed(
//     "📧 طلب مراجعة حسابات جيميل",
//     `تم تسليم **${gmailCount}** حساب جيميل من **${interaction.user.displayName}**\n✅ **جميع الجيميلات متوافقة مع الصيغة المطلوبة**`
//   )
//     .addFields(
//       {
//         name: "👤 المُرسِل",
//         value: `${interaction.user} (${interaction.user.id})`,
//         inline: true,
//       },
//       {
//         name: "📊 العدد والمكافأة",
//         value: `**${gmailCount}** جيميل\n**${totalCoins}** كوين`,
//         inline: true,
//       },
//       {
//         name: "📧 الحسابات المعتمدة",
//         value:
//           formattedGmails.length > 800
//             ? formattedGmails.substring(0, 800) + "..."
//             : formattedGmails,
//         inline: false,
//       },
//       {
//         name: "📝 ملاحظات",
//         value: additionalInfo,
//         inline: false,
//       }
//     )
//     .setImage(proofImage)
//     .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
//     .setFooter({
//       text: `معرف المرسل: ${interaction.user.id} | تم التحقق من الصيغة ✅`,
//     });

//   const approveButton = new ButtonBuilder()
//     .setCustomId(`approve_${interaction.user.id}_${gmailCount}`)
//     .setLabel(`موافقة (${totalCoins} كوين)`)
//     .setStyle(ButtonStyle.Success)
//     .setEmoji("✅");

//   const rejectButton = new ButtonBuilder()
//     .setCustomId(`reject_${interaction.user.id}`)
//     .setLabel("رفض")
//     .setStyle(ButtonStyle.Danger)
//     .setEmoji("❌");

//   const approvalRow = new ActionRowBuilder().addComponents(
//     approveButton,
//     rejectButton
//   );

//   await submissionChannel.send({
//     embeds: [submissionEmbed],
//     components: [approvalRow],
//   });

//   const attachment = new AttachmentBuilder("./Assets/line.png", {
//     name: "line.png",
//   });

//   await submissionChannel.send({ files: [attachment] });

//   await interaction.reply({
//     embeds: [
//       createEmbed(
//         "✅ تم التسليم بنجاح",
//         `تم تسليم **${gmailCount}** حساب جيميل بنجاح\n✅ **جميع الجيميلات متوافقة مع الصيغة المطلوبة**\n\nالمكافأة المتوقعة: **${totalCoins}** كوين\n\nسيتم المراجعة قريباً`
//       ),
//     ],
//     ephemeral: true,
//   });
// }

// // دالة معالجة أزرار الموافقة والرفض
// async function handleApprovalButtons(interaction) {
//   const parts = interaction.customId.split("_");
//   const action = parts[0];
//   const userId = parts[1];
//   const gmailCount = action === "approve" ? parseInt(parts[2]) : 0;

//   if (action === "approve") {
//     await handleApproval(interaction, userId, gmailCount);
//   } else if (action === "reject") {
//     await showRejectModal(interaction, userId);
//   }
// }

// // دالة معالجة الموافقة
// async function handleApproval(interaction, userId, gmailCount) {
//   try {
//     const user = await interaction.client.users.fetch(userId);
//     const totalCoins = gmailCount * COINS_PER_GMAIL;

//     let userdb = await DB.findOne({ userid: userId });

//     if (!userdb) {
//       userdb = new DB({
//         userid: userId,
//         username: user.username,
//         balance: totalCoins,
//       });
//       await userdb.save();
//     } else {
//       const newBalance = Math.floor(parseInt(userdb.balance) + totalCoins);
//       await DB.findOneAndUpdate({ userid: userId }, { balance: newBalance });
//     }

//     const approvalEmbed = createEmbed(
//       "🎉 تم قبول حساباتك",
//       `تم قبول **${gmailCount}** حساب جيميل\nتم إضافة **${totalCoins}** كوين لرصيدك`
//     ).addFields({
//       name: "👤 تمت المراجعة بواسطة",
//       value: `${interaction.user}`,
//       inline: false,
//     });

//     try {
//       await user.send({ embeds: [approvalEmbed] });
//     } catch (dmError) {
//       console.log(`لا يمكن إرسال رسالة خاصة للمستخدم ${user.username}`);
//     }

//     const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
//       .setTitle("✅ تم القبول")
//       .setColor("#4CAF50")
//       .addFields({
//         name: "🎯 النتيجة",
//         value: `**✅ مقبول**\n**المراجع:** ${interaction.user}\n**الكوينز:** ${totalCoins}`,
//         inline: false,
//       });

//     await interaction.update({
//       embeds: [originalEmbed],
//       components: [],
//     });
//   } catch (error) {
//     console.error("❌ خطأ في معالجة الموافقة:", error);
//     await interaction.reply({
//       content: "❌ حدث خطأ في معالجة الموافقة",
//       ephemeral: true,
//     });
//   }
// }

// // دالة عرض نموذج سبب الرفض
// async function showRejectModal(interaction, userId) {
//   const rejectModal = new ModalBuilder()
//     .setCustomId(`reject_reason_${userId}`)
//     .setTitle("❌ رفض التسليم");

//   const reasonInput = new TextInputBuilder()
//     .setCustomId("reject_reason")
//     .setLabel("📝 سبب الرفض")
//     .setStyle(TextInputStyle.Paragraph)
//     .setPlaceholder("اكتب سبب الرفض...")
//     .setRequired(true)
//     .setMinLength(10)
//     .setMaxLength(500);

//   const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
//   rejectModal.addComponents(reasonRow);

//   await interaction.showModal(rejectModal);
// }

// // دالة معالجة نموذج الرفض
// async function handleRejectionModal(interaction) {
//   const userId = interaction.customId.split("_")[2];
//   const rejectReason = interaction.fields.getTextInputValue("reject_reason");

//   try {
//     const user = await interaction.client.users.fetch(userId);

//     const rejectionEmbed = createEmbed(
//       "❌ تم رفض التسليم",
//       `تم رفض حسابات الجيميل التي قمت بتسليمها`
//     ).addFields(
//       { name: "📝 سبب الرفض", value: rejectReason, inline: false },
//       { name: "👤 المراجع", value: `${interaction.user}`, inline: false }
//     );

//     try {
//       await user.send({ embeds: [rejectionEmbed] });
//     } catch (dmError) {
//       console.log(`لا يمكن إرسال رسالة خاصة للمستخدم ${user.username}`);
//     }

//     const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
//       .setTitle("❌ تم الرفض")
//       .setColor("#F44336")
//       .addFields({
//         name: "🚫 النتيجة",
//         value: `**❌ مرفوض**\n**المراجع:** ${
//           interaction.user
//         }\n**السبب:** ${rejectReason.substring(0, 100)}...`,
//         inline: false,
//       });

//     await interaction.update({
//       embeds: [originalEmbed],
//       components: [],
//     });
//   } catch (error) {
//     console.error("❌ خطأ في معالجة الرفض:", error);
//     await interaction.reply({
//       content: "❌ حدث خطأ في معالجة الرفض",
//       ephemeral: true,
//     });
//   }
// }
