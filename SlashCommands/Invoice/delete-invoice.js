const { SlashCommandBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Invoices.json" });

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("delete-invoice")
    .setDescription("لمسح فاتورة من الداتا")
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

    const updatedInvoices = guildInvoices.filter(id => id !== invoiceId);
    db.set(`invoices_${interaction.guild.id}`, updatedInvoices);
    db.delete(`invoice_${invoiceId}`);

    interaction.reply({
      content: `**تم مسح الفاتورة** \`${invoiceId}\` **بنجاح**`,
      ephemeral: true,
    });
  },
};
