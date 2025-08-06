const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  ButtonStyle,
  Events,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const config = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Reports.json" });

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isStringSelectMenu()) {
      const selectedValue = interaction.values[0];
      const data = db.get(`report_${interaction.message.id}`);
      if (selectedValue === "close-report") {
        const { image, title, description, user, time } = data;
        const User = interaction.guild.members.cache.get(user);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp(Date.now())
          .setColor(config.EmbedColor)
          .setTitle(title)
          .setDescription(
            `**` +
              description +
              `**` +
              `\n\n**User:** ${User}\n**ID:** ${user}\n**Time:** ${time}\n\n**Status:** \`Closed\``
          )
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        if (image) {
          embed.setImage(image);
        }
        db.delete(`report_${interaction.message.id}`);
        db.delete(`report_${user}`);
        await interaction.update({ embeds: [embed], components: [] });
      } else if (selectedValue === "solve-dm") {
        const { image, title, description, user, time } = data;
        const User = interaction.guild.members.cache.get(user);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp(Date.now())
          .setColor(config.EmbedColor)
          .setTitle(title)
          .setDescription(
            `**` +
              description +
              `**` +
              `\n\n**User:** ${User}\n**ID:** ${user}\n**Time:** ${time}\n\n**Status:** \`Solved\``
          )
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        if (image) {
          embed.setImage(image);
        }

        const userEmbed = new EmbedBuilder()
          .setTimestamp(Date.now())
          .setColor(config.EmbedColor)
          .setDescription(
            `**Hello!**\n\n- Your Problem has been solved successfully!\n- Thanks for using our services.`
          );

        db.delete(`report_${interaction.message.id}`);
        db.delete(`report_${user}`);
        await User.send({ embeds: [userEmbed] });
        await interaction.update({ embeds: [embed], components: [] });
      } else if (selectedValue === "user-dm") {
        const modal = new ModalBuilder()
          .setCustomId("user-dm-modal")
          .setTitle("Send DM");

        const message = new TextInputBuilder()
          .setCustomId("message")
          .setLabel("Message")
          .setStyle(TextInputStyle.Paragraph);

        const row = new ActionRowBuilder().addComponents(message);
        modal.addComponents(row);
        await interaction.showModal(modal);
      } else if (selectedValue === "timeout-reporter") {
        const { image, title, description, user, time } = data;
        const User = interaction.guild.members.cache.get(user);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp(Date.now())
          .setColor(config.EmbedColor)
          .setTitle(title)
          .setDescription(
            `**` +
              description +
              `**` +
              `\n\n**User:** ${User}\n**ID:** ${user}\n**Time:** ${time}\n\n**Status:** \`Timeout\``
          )
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        if (image) {
          embed.setImage(image);
        }

        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply({ content: "Done" });
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        
        await User.timeout(10 * 60 * 1000, "Reported User");
        
        db.delete(`report_${interaction.message.id}`);
        db.delete(`report_${user}`);
      }
    } else if (
      interaction.isModalSubmit() &&
      interaction.customId === "user-dm-modal"
    ) {
      const data = db.get(`report_${interaction.message.id}`);
      const User = interaction.guild.members.cache.get(data.user);
      const message = interaction.fields.getTextInputValue("message");
      const embed = new EmbedBuilder()
        .setTitle(`Support Notification`)
        .setDescription(message)
        .setColor(config.EmbedColor);
      await User.send({ embeds: [embed] });
      await interaction.reply({ content: "Sent", ephemeral: true });
    }
  },
};
