const { Events, AttachmentBuilder, PermissionsBitField } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const linedb = new JsonDatabase({ databasePath: "./DataBase/AutoLine.json" });

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      if (!message.guild || message.author.bot) return;

      const autolineRooms = linedb.get("autoline_rooms");

      if (!Array.isArray(autolineRooms) || !autolineRooms.includes(message.channel.id)) return;

      const permissions = message.channel.permissionsFor(message.guild.members.me);
      if (!permissions || !permissions.has(PermissionsBitField.Flags.SendMessages)) return;
      

      const attachment = new AttachmentBuilder("./Assets/line.png", {
        name: "line.png",
      });

      await message.channel.send({ files: [attachment] });

    } catch (err) {
      console.error("❌ خطأ في Event AutoLine:", err.message);
    }
  },
};
