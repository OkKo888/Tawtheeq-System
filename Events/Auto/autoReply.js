const { Events } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const { ai } = require("../../Config.json");
const replydb = new JsonDatabase({ databasePath: "./DataBase/Replys.json" });
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const blacklistCooldowns = new Map();
const BLACKLIST_COOLDOWN_TIME = 30000;

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    try {
      if (message.author.bot || !message.guild) return;
      if (message.channel.id !== ai) return;

      const allReplies = replydb.all();

      if (!allReplies || allReplies.length === 0) return;

      for (const entry of allReplies) {
        const { command, reply } = entry.data;

        if (
          message.content.trim().toLowerCase() === command.trim().toLowerCase()
        ) {
          const blacklistCheck = blackdb.get(`sccblack_${message.author.id}`);
          if (blacklistCheck) {
            const userId = message.author.id;
            const now = Date.now();
            const lastWarning = blacklistCooldowns.get(userId);

            if (!lastWarning || now - lastWarning >= BLACKLIST_COOLDOWN_TIME) {
              message.author
                .send("❌ لقد تم حظرك من استخدام هذا البوت.")
                .catch(() => {});
              blacklistCooldowns.set(userId, now);
            }

            return;
          }

          await message.channel.send(reply);
          break;
        }
      }
    } catch (err) {
      console.error("❌ خطأ في autoReply Event:", err.message);
    }
  },
};
