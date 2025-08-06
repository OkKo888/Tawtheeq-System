const { Events, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { tax, EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const blacklistCooldowns = new Map();
const BLACKLIST_COOLDOWN_TIME = 30000;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.channel.type === "dm" || message.author.bot) return;
    if (message.channel.id == tax) {
      const blacklistCheck = blackdb.get(`sccblack_${message.author.id}`);
      if (blacklistCheck) {
        message.delete();
        
        const userId = message.author.id;
        const now = Date.now();
        const lastWarning = blacklistCooldowns.get(userId);
        
        if (!lastWarning || (now - lastWarning) >= BLACKLIST_COOLDOWN_TIME) {
          message.author.send("❌ لقد تم حظرك من استخدام هذا البوت.").catch(() => {});
          blacklistCooldowns.set(userId, now);
        }
        
        return;
      }

      const number = message.content;
      if (message.author.bot) return;

      let number2 = parseInt(number.replace(/[^\d.]/g, ""));
      if (isNaN(number2)) return message.delete();

      if (number.endsWith("k") || number.endsWith("K")) number2 *= 1000;
      else if (number.endsWith("m") || number.endsWith("M")) number2 *= 1000000;

      let tax = Math.floor((number2 * 20) / 19 + 1); // المبلغ مع الضريبة
      let tax2 = Math.floor(tax - number2); // الضريبة
      let tax3 = Math.floor((tax * 20) / 19 + 1); // المبلغ مع ضريبة الوسيط
      let tax4 = Math.floor(tax3 - tax); // ضريبة الوسيط

      const embed1 = new EmbedBuilder()
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp(Date.now())
        .setColor(EmbedColor)
        .addFields([
          {
            name: "**المبلغ**",
            value: `**\`${number2}\`**`,
            inline: true,
          },
          {
            name: "**المبلغ مع الضريبة**",
            value: `**\`${tax}\`**`,
            inline: true,
          },
          {
            name: "**المبلغ مع ضريبة الوسيط**",
            value: `**\`${tax3}\`**`,
            inline: false,
          },
          {
            name: "**الضريبة**",
            value: `**\`${tax2}\`**`,
            inline: true,
          },
          {
            name: "**ضريبة الوسيط**",
            value: `**\`${tax4}\`**`,
            inline: true,
          },
        ]);

      message.reply({ content: `<@${message.author.id}>`, embeds: [embed1] });
      const attachment = new AttachmentBuilder("./Assets/line.png", {
        name: "line.png",
      });
      await message.channel.send({ files: [attachment] });
    }
  },
};
