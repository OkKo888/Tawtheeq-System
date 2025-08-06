const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { EmbedColor } = require("../../Config.json");

const SUBMISSION_CHANNEL_ID = '1399554216523202711';
const COINS_PER_GMAIL = 10;

// دالة مساعدة لإنشاء Embed محسّن
function createEmbed(title, description, color = EmbedColor) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: 'نظام تسليم الحسابات - توثيق', iconURL: 'https://cdn.discordapp.com/emojis/1269376954704855050.png' })
        .setImage('https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2022/12/gmail-1670832078.jpg')
        .setTimestamp();
}

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {
        if (message.content === '!gmail-panel' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            const panelEmbed = createEmbed(
                '📧 تسليم حسابات Gmail',
                `✉️ **طريقة التسليم:**\nقم بالضغط على الزر أدناه لتسليم حسابات الجيميل الخاصة بك.

💰 **السعر:** \`${COINS_PER_GMAIL} كوينز\` لكل حساب  
📝 **الصيغة المطلوبة:**\n\`\`\`\njackroller767@gmail.com\nmelvinkelvin190@gmail.com\n...\`\`\`

🔒 تأكد من أن الحسابات صالحة لتجنب الخصم دون مقابل.`
            ).setThumbnail(message.guild.iconURL({ dynamic: true }));

            const submitButton = new ButtonBuilder()
                .setCustomId('submit_gmail')
                .setLabel('تسليم الشغل')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📨');

            const actionRow = new ActionRowBuilder().addComponents(submitButton);

            await message.channel.send({
                embeds: [panelEmbed],
                components: [actionRow]
            });

            await message.delete().catch(() => {});
        }
    }
};
