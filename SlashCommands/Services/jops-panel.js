const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const { EmbedColor } = require("../../Config.json");

const COINS_PER_GMAIL = 10;

function createEmbed(title, description, color = EmbedColor) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: 'نظام تسليم الحسابات - توثيق' })
        .setImage('https://cdn.discordapp.com/attachments/1377241708533907488/1402694933151879369/image.png?ex=6894d8f4&is=68938774&hm=5f52513c0ca007a9673c9d000a896b5f8d58141b9d2f2e7ebe234976b8a42837&')
        .setTimestamp();
}

module.exports = {
    roles: "role:1399012282574438541",
    data: new SlashCommandBuilder()
        .setName("jops-panel")
        .setDescription("بانل تسليم حسابات جيميل"),
    async execute(interaction) {
        const panelEmbed = createEmbed(
            '📧 تسليم حسابات Gmail',
            `✉️ **طريقة التسليم:**\nقم بالضغط على الزر أدناه لتسليم حسابات الجيميل الخاصة بك.

💰 **السعر:** \`${COINS_PER_GMAIL} كوينز\` لكل حساب
📝 **الصيغة المطلوبة:**\n\`\`\`\njackroller767@gmail.com\nmelvinkelvin190@gmail.com\n...\`\`\`

🔒 تأكد من أن الحسابات صالحة لتجنب الخصم دون مقابل.`
        ).setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        const submitButton = new ButtonBuilder()
            .setCustomId('submit_gmail')
            .setLabel('تسليم الشغل')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📨');

        const actionRow = new ActionRowBuilder().addComponents(submitButton);

        await interaction.reply({ content: '**Sent**', ephemeral: true });

        const message = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [actionRow]
        });

        setInterval(() => {
            message.edit({
                embeds: [panelEmbed],
                components: [actionRow]
            });
        }, 30000);
    }
};