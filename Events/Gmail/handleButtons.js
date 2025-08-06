const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { EmbedColor } = require("../../Config.json");
const DB = require("../../Schema/users.js");
const { JsonDatabase } = require("wio.db");

const invoiceDB = new JsonDatabase({ databasePath: "./DataBase/Invoices.json" });
const coinsDB = new JsonDatabase({ databasePath: "./DataBase/Coins.json" });
const COINS_PER_GMAIL = 10;

function createEmbed(title, description, color = EmbedColor) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

function generateInvoiceId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${timestamp.slice(-6)}-${random}`;
}

function createInvoiceEmbed(invoiceId, gmailCount, totalCoins, user, reviewer) {
  return new EmbedBuilder()
    .setTitle("🧾 فاتورة تسليم حسابات Gmail")
    .setColor(EmbedColor)
    .addFields(
      { name: "🆔 رقم الفاتورة", value: `\`${invoiceId}\``, inline: true },
      { name: "👤 المستخدم", value: `${user}`, inline: true },
      { name: "📅 التاريخ", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      { name: "📧 عدد الحسابات", value: `${gmailCount}`, inline: true },
      { name: "💰 المبلغ", value: `${totalCoins} كوين`, inline: true },
      { name: "✅ الحالة", value: "مقبول", inline: true },
      { name: "👨‍💼 المراجع", value: `${reviewer}`, inline: false }
    )
    .setFooter({ text: "نظام تسليم الحسابات - توثيق", iconURL: "https://cdn.discordapp.com/emojis/1269376954704855050.png" })
    .setTimestamp();
}

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    try {
      if (
        interaction.isButton() &&
        (interaction.customId.startsWith("approve_") ||
          interaction.customId.startsWith("reject_"))
      ) {
        await handleApprovalButtons(interaction);
      }

      if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("reject_reason_")
      ) {
        await handleRejectionModal(interaction);
      }

      // زر جيميلات: إرسال الجيميلات كـ content (ephemeral)
      if (
        interaction.isButton() &&
        interaction.customId.startsWith("show_gmails_")
      ) {
        // استخراج الجيميلات من أول embed في الرسالة الأصلية
        const embed = interaction.message.embeds[0];
        let response = "";
        
        // البحث عن الجيميلات بدون أرقام
        const withoutNumbersField = embed?.fields?.find(f => f.name.includes("بدون أرقام"));
        if (withoutNumbersField) {
          let gmailsWithoutNumbers = withoutNumbersField.value.replace(/\*|`|\n?\.\.\..*/g, "").trim();
          if (gmailsWithoutNumbers && gmailsWithoutNumbers.length > 5) {
            response += `**📧 الجيميلات بدون أرقام:**\n${gmailsWithoutNumbers}\n\n`;
          }
        }
        
        // البحث عن الجيميلات مع أرقام
        const withNumbersField = embed?.fields?.find(f => f.name.includes("مع أرقام"));
        if (withNumbersField) {
          let gmailsWithNumbers = withNumbersField.value.replace(/\*|`|\n?\.\.\..*/g, "").trim();
          if (gmailsWithNumbers && gmailsWithNumbers.length > 5) {
            response += `**📧 الجيميلات مع أرقام:**\n${gmailsWithNumbers}`;
          }
        }
        
        // إذا لم يتم العثور على أي من الحقول الجديدة، جرب الحقل القديم
        if (!response) {
          const oldGmailsField = embed?.fields?.find(f => f.name.includes("الحسابات المعتمدة") || f.name.includes("الحسابات"));
          if (oldGmailsField) {
            let gmails = oldGmailsField.value.replace(/\*|`|\n?\.\.\..*/g, "").trim();
            if (gmails && gmails.length > 5) {
              response = gmails;
            }
          }
        }
        
        if (!response || response.length < 5) {
          return interaction.reply({ content: "❌ لا يمكن استخراج الجيميلات من الرسالة.", ephemeral: true });
        }
        
        // أرسل الجيميلات كـ content (ephemeral)
        return interaction.reply({ content: `\u200B\n${response}`, ephemeral: true });
      }
    } catch (error) {
      console.error("❌ خطأ في التعامل مع التفاعل:", error);

      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: "❌ حدث خطأ تقني، حاول مرة أخرى.",
            ephemeral: true,
          });
        } catch (replyError) {
          console.error("خطأ في إرسال رد الخطأ:", replyError);
        }
      }
    }
  },
};

async function handleApprovalButtons(interaction) {
  const parts = interaction.customId.split("_");
  const action = parts[0];
  const userId = parts[1];
  const gmailCount = action === "approve" ? parseInt(parts[2]) : 0;

  if (action === "approve") {
    await handleApproval(interaction, userId, gmailCount);
  } else if (action === "reject") {
    await showRejectModal(interaction, userId);
  }
}

async function handleApproval(interaction, userId, gmailCount) {
  try {
    const user = await interaction.client.users.fetch(userId);
    const totalCoins = gmailCount * COINS_PER_GMAIL;
    const invoiceId = generateInvoiceId();

    let coins = coinsDB.get("coins") || {};
    coins[userId] = (coins[userId] || 0) + totalCoins;
    coinsDB.set("coins", coins);

    const invoiceData = {
      id: invoiceId,
      userId: userId,
      username: user.username,
      gmailCount: gmailCount,
      totalCoins: totalCoins,
      status: "مقبول",
      reviewer: interaction.user.id,
      reviewerName: interaction.user.username,
      timestamp: Date.now(),
      guildId: interaction.guild.id
    };

    let guildInvoices = invoiceDB.get(`invoices_${interaction.guild.id}`) || [];
    guildInvoices.push(invoiceId);
    invoiceDB.set(`invoices_${interaction.guild.id}`, guildInvoices);
    invoiceDB.set(`invoice_${invoiceId}`, invoiceData);

    const approvalEmbed = createEmbed(
      "✅ تم قبول التسليم",
      `تم قبول **${gmailCount}** حسابات جيميل\nتم إضافة **${totalCoins}** كوين لرصيدك\n\n🧾 **رقم الفاتورة:** \`${invoiceId}\``
    ).addFields({
      name: "👤 تمت المراجعة بواسطة",
      value: `${interaction.user}`,
      inline: false,
    });

    const invoiceEmbed = createInvoiceEmbed(invoiceId, gmailCount, totalCoins, user, interaction.user);

    try {
      await user.send({ embeds: [approvalEmbed, invoiceEmbed] });
    } catch (dmError) {
      console.log(`لا يمكن إرسال رسالة خاصة للمستخدم ${user.username}`);
    }

    const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setTitle("✅ تم القبول")
      .setColor(EmbedColor)
      .addFields(
        {
          name: "🎯 النتيجة",
          value: `**✅ مقبول**\n**المراجع:** ${interaction.user}\n**الكوينز:** ${totalCoins}`,
          inline: false,
        },
        {
          name: "🧾 رقم الفاتورة",
          value: `\`${invoiceId}\``,
          inline: false,
        }
      );

    const gmailsButton = new ActionRowBuilder().addComponents(
      new (require("discord.js").ButtonBuilder)()
        .setCustomId(`show_gmails_${userId}`)
        .setLabel("جيميلات")
        .setStyle(require("discord.js").ButtonStyle.Primary)
        .setEmoji("📋")
    );

    await interaction.update({
      embeds: [originalEmbed],
      components: [gmailsButton],
    });

    let userdb = await DB.findOne({ userid: userId });

    if (!userdb) {
      userdb = new DB({
        userid: userId,
        username: user.username,
        balance: totalCoins,
      });
      await userdb.save();
    } else {
      const newBalance = Math.floor(parseInt(userdb.balance) + totalCoins);
      await DB.findOneAndUpdate({ userid: userId }, { balance: newBalance });
    }
  } catch (error) {
    console.error("❌ خطأ في معالجة الموافقة:", error);
    await interaction.reply({
      content: "❌ حدث خطأ في معالجة الموافقة",
      ephemeral: true,
    });
  }
}

async function showRejectModal(interaction, userId) {
  const rejectModal = new ModalBuilder()
    .setCustomId(`reject_reason_${userId}`)
    .setTitle("❌ رفض التسليم");

  const reasonInput = new TextInputBuilder()
    .setCustomId("reject_reason")
    .setLabel("📝 سبب الرفض")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("اكتب سبب الرفض...")
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(500);

  const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
  rejectModal.addComponents(reasonRow);

  await interaction.showModal(rejectModal);
}

async function handleRejectionModal(interaction) {
  const userId = interaction.customId.split("_")[2];
  const rejectReason = interaction.fields.getTextInputValue("reject_reason");

  try {
    const user = await interaction.client.users.fetch(userId);

    const rejectionEmbed = createEmbed(
      "❌ تم رفض التسليم",
      `تم رفض حسابات الجيميل التي قمت بتسليمها`
    ).addFields(
      { name: "📝 سبب الرفض", value: rejectReason, inline: false },
      { name: "👤 المراجع", value: `${interaction.user}`, inline: false }
    );

    try {
      await user.send({ embeds: [rejectionEmbed] });
    } catch (dmError) {
      console.log(`لا يمكن إرسال رسالة خاصة للمستخدم ${user.username}`);
    }

    const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setTitle("❌ تم الرفض")
      .setColor(EmbedColor)
      .addFields({
        name: "🚫 النتيجة",
        value: `**❌ مرفوض**\n**المراجع:** ${
          interaction.user
        }\n**السبب:** ${rejectReason.substring(0, 100)}...`,
        inline: false,
      });

    await interaction.update({
      embeds: [originalEmbed],
      components: [],
    });
  } catch (error) {
    console.error("❌ خطأ في معالجة الرفض:", error);
    await interaction.reply({
      content: "❌ حدث خطأ في معالجة الرفض",
      ephemeral: true,
    });
  }
}
