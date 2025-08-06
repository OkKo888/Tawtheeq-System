const { Events, ChannelType, AttachmentBuilder } = require('discord.js');
const { feedback } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const blacklistCooldowns = new Map();
const BLACKLIST_COOLDOWN_TIME = 30000;

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        try {
            if (message.channel.type === ChannelType.DM || message.author.bot) return;
            if (feedback.includes(message.channel.id)) {

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

                await message.react('❤️');

                const attachment = new AttachmentBuilder(`${process.cwd()}/Assets/line.png`)
                await message.channel.send({files: [attachment]});
               try {
                    await message.author.send({ content: `شكراً لك على مشاركة رأيك معنا! ✨` });
                } catch (dmError) {
                    console.log('لا يمكن إرسال رسالة خاصة للمستخدم:', dmError.message);
                }
            }
        } catch (err) {
            console.error('خطأ في نظام الفيدباك:', err.message);
        }
    }
};