const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DB = require("../../Schema/users.js");
const { EmbedColor } = require("../../Config.json");

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("اعادة ضبط عدد العملات لمستخدم إلى الصفر")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to reset their balance to 0")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    try {
      const sent = await interaction.deferReply({ fetchReply: true });

      const targetUser = interaction.options.getUser("user");

      let embed = new EmbedBuilder()
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp(Date.now())
        .setColor(EmbedColor);

      const userDB = await DB.findOne({ userid: targetUser.id });

      if (!userDB) {
        embed.setDescription(`**${targetUser} ليس لديه رصيد.**`);
        return interaction.editReply({ embeds: [embed] });
      }

      await DB.findOneAndDelete({ userid: targetUser.id });

      embed.setDescription(`**تم تصفير رصيد لـ ${targetUser}.**`);
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      return interaction.editReply({
        content: "**حدث خطأ. يرجى المحاولة مرة أخرى.**",
      });
    }
  },
};
