const { SlashCommandBuilder,Events ,Client, ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Settings.json" });

module.exports = {
  name: Events.InteractionCreate,
    /**
    * @param {Interaction} interaction
  */
  async execute(interaction){
   if(interaction.isButton()) {
    if(interaction.customId == "add_token_button") {
        try {
            const modal = new ModalBuilder()
            .setCustomId(`add_token_modal`)
            .setTitle(`اضافة توكن بوت برودكاست`)
            const tokenn = new TextInputBuilder()
            .setCustomId('the_token')
            .setLabel(`التوكن`)
            .setStyle(TextInputStyle.Short)
            .setMinLength(65)
            .setMaxLength(85)
            const firstActionRow = new ActionRowBuilder().addComponents(tokenn);
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal)
        } catch (error) {
            return interaction.reply({content:`${error.message}`})
        }
    }
   }
   if(interaction.isModalSubmit()) {
    if(interaction.customId == "add_token_modal") {
        try {
            await interaction.deferReply({ephemeral:false});
            const thetoken = interaction.fields.getTextInputValue(`the_token`)
            const thetokens = db.get(`tokens`)
            if(thetokens) {
                if(thetokens.includes(thetoken)) {
                    return interaction.editReply({content:`**هذا التوكن موجود باللفعل**`})
                }
            }
            const clienter = new Client({intents:32767})
            await clienter.login(thetoken)
            clienter.user.setActivity(`Hello I'm BC Bot`)
            const embed1 = new EmbedBuilder()
            .setTitle(`**تم تسجيل الدخول بنجاح**`)
            .setTimestamp()
            .setColor(`Gold`)
            .addFields(
                {
                    name:`**اسم البوت**`,value:`**\`\`\`${clienter.user.tag}\`\`\`**`,inline:false
                },
                {
                    name:`**ايدي البوت**`,value:`**\`\`\`${clienter.user.id}\`\`\`**`,inline:false
                }
            )
            const invitebot = new ButtonBuilder()
	.setLabel('دعوة البوت')
	.setURL(`https://discord.com/api/oauth2/authorize?client_id=${clienter.user.id}&permissions=8&scope=bot`)
	.setStyle(ButtonStyle.Link);
    const row = new ActionRowBuilder().addComponents(invitebot);
            await interaction.editReply({embeds:[embed1],components:[row]})
            let tokens = db.get(`tokens`)
            if(!tokens) {
                await db.set(`tokens` , [thetoken])
            } else {
                await db.push(`tokens` , thetoken)
            }
            tokens = db.get(`tokens`)
            const broadcast_msg = db.get(`broadcast_msg`) ?? "لم يتم تحديد رسالة"
        const msgid = db.get(`msgid`)
        if(msgid) {
            const msg = interaction.channel.messages.fetch(msgid).then(async(msgg) => {
                const embed2 = new EmbedBuilder()
                .setTitle(`**التحكم في البرودكاست**`)
                .addFields(
                    {
                        name:`**عدد البوتات المسجلة حاليا**`,value:`**\`\`\`${tokens.length ?? "فشل التحديد"} من البوتات\`\`\`**`,inline:false
                    },
                    {
                        name:`**رسالة البرودكاست الحالية**`,value:`**\`\`\`${broadcast_msg}\`\`\`**`,inline:false
                    },
                )
                .setDescription(`**يمكنك التحكم في البوت عن طريق الازرار**`)
                .setColor(`Gold`)
                .setFooter({text:interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true})})
                .setAuthor({name:interaction.guild.name , iconURL:interaction.guild.iconURL({dynamic:true})})
                .setTimestamp(Date.now())
                msgg.edit({embeds:[embed2]})
            })
        }
        } catch (error) {
                return interaction.editReply({content:`**الرجاء التأكد من توكن البوت أو تفعيل الخيارات الثلاثة الاخيرة من اعدادات البوت**`})
        }
    }
   }
  }
}