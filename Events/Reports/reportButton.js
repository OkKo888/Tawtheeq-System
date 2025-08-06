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
  AttachmentBuilder,
} = require("discord.js");
const config = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./DataBase/Reports.json" });

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === "create-report") {
        // check if user is already reported
        const reported = db.get(`report_${interaction.user.id}`);
        if (reported) {
          return interaction.reply({
            content: "**You have already reported.**",
            ephemeral: true,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId("reportModal")
          .setTitle("Order");

        const title = new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Title")
          .setPlaceholder("Write the title of problem here...")
          .setMinLength(3)
          .setMaxLength(30)
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const description = new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Description")
          .setMinLength(3)
          .setMaxLength(300)
          .setPlaceholder("Write your problem here...")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const image = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image")
          .setMinLength(3)
          .setMaxLength(300)
          .setPlaceholder("Write your image URL here...")
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(title);
        const secondRow = new ActionRowBuilder().addComponents(description);
        const thirdRow = new ActionRowBuilder().addComponents(image);

        modal.addComponents(firstRow, secondRow, thirdRow);

        try {
          await interaction.showModal(modal);
        } catch (error) {
          console.error("Error showing modal:", error);
          await interaction.reply({
            content:
              "There was an error displaying the modal. Please try again later.",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "reportModal") {
        const title = interaction.fields.getTextInputValue("title");
        const description = interaction.fields.getTextInputValue("description");
        const image = interaction.fields.getTextInputValue("image");
        const channel = await interaction.guild.channels.fetch(config.report);
        if (!title || !description) {
          await interaction.reply({
            content: "You must fill out all the fields.",
            ephemeral: true,
          });
          return;
        }
        if (image) {
          let checkImage = await isURL(image);
          if (!checkImage) {
            return interaction.reply({
              content: "**الرجاء ادخال رابط صورة صحيح.**",
              ephemeral: true,
            });
          }
        }
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
              `\n\n**User:** <@${interaction.user.id}>\n**ID:** ${
                interaction.user.id
              }\n**Time:** ${new Date().toLocaleString()}\n\n**Status:** \`No Action\``
          )
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        if (image) {
          embed.setImage(image);
        }

        const select = new StringSelectMenuBuilder()
          .setCustomId("report-select")
          .setPlaceholder("Please select an option.")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Problem Solved")
              .setValue("solve-dm"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Send DM")
              .setValue("user-dm"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Close Report")
              .setValue("close-report"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Timeout Reporter")
              .setValue("timeout-reporter")
          );

        await interaction.reply({
          content: "**Your report has been sent successfully.**",
          ephemeral: true,
        });
        const msg = await channel.send({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(select)],
        });
        const attachment = new AttachmentBuilder("./Assets/line.png", {
          name: "line.png",
        });
        await channel.send({ files: [attachment] });

        await db.set(`report_${msg.id}`, {
          title: title,
          description: description,
          image: image || null,
          user: interaction.user.id,
          time: new Date().toLocaleString(),
        });

        await db.set(`report_${interaction.user.id}`, true);
      }
    }
  },
};

function isURL(url) {
  if (!url) return false;
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))|" +
      "localhost" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(url);
}
