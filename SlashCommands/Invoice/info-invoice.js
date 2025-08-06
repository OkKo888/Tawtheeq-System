const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Invoices.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("info-invoice")
    .setDescription("لأستعلام عن فاتورة")
    .addStringOption((option) =>
      option
        .setName("invoice")
        .setDescription("قم بكتابة رقم الفاتورة")
        .setRequired(true)
    ),
  async execute(interaction) {
    const invoiceId = interaction.options.getString("invoice");
    const guildInvoices = db.get(`invoices_${interaction.guild.id}`);

    if (!guildInvoices || guildInvoices.length === 0) {
      return interaction.reply({
        content: "**لا توجد اي فواتير في الداتا**",
        ephemeral: true,
      });
    }

    if (!guildInvoices.includes(invoiceId)) {
      return interaction.reply({
        content: "**هذه الفاتورة غير موجودة**",
        ephemeral: true,
      });
    }

    const invoiceData = db.get(`invoice_${invoiceId}`);
    
    if (!invoiceData) {
      return interaction.reply({
        content: "**خطأ في استرجاع بيانات الفاتورة**",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🧾 تفاصيل الفاتورة")
      .setColor(EmbedColor)
      .addFields(
        { name: "🆔 رقم الفاتورة", value: `\`${invoiceData.id}\``, inline: true },
        { name: "👤 المستخدم", value: `<@${invoiceData.userId}>`, inline: true },
        { name: "📅 التاريخ", value: `<t:${Math.floor(invoiceData.timestamp / 1000)}:F>`, inline: true },
        { name: "📧 عدد الحسابات", value: `${invoiceData.gmailCount}`, inline: true },
        { name: "💰 المبلغ", value: `${invoiceData.totalCoins} كوين`, inline: true },
        { name: "✅ الحالة", value: invoiceData.status, inline: true },
        { name: "👨‍💼 المراجع", value: `<@${invoiceData.reviewer}>`, inline: false }
      )
      .setFooter({ text: "نظام تسليم الحسابات - توثيق", iconURL: "https://cdn.discordapp.com/emojis/1269376954704855050.png" })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
