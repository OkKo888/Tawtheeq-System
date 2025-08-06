const {
  Events,
  AttachmentBuilder
} = require("discord.js");
const { suggestion } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const blacklistCooldowns = new Map();
const BLACKLIST_COOLDOWN_TIME = 30000;

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.channel.type === "dm" || message.author.bot) return;
    if (message.content) {
      if (message.author.bot) return;
      if (message.channel.id !== suggestion) return;

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

      try {
        await message.react('<:1372checkmark:1400612127852462212>');
        await message.react('<:2360cross:1400612134727057420>');

        const attachment = new AttachmentBuilder("./Assets/line.png", {
          name: "line.png",
        });
        await message.channel.send({ files: [attachment] });
      } catch (err) {
        console.error(err);
      }
    }
  },
};
