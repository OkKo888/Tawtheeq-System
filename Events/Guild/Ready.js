const { Events, ActivityType } = require("discord.js");
const db = require("pro.db");
const chalk = require("chalk");
const fs = require("fs");
const token = fs.readFileSync("Token.txt", "utf8");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    const Status = "Streaming";
    const Activity = "Tawtheeq Team";

    client.user.setStatus(Status);
    client.user.setActivity({
      name: Activity,
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/tawtheeq"
    });

    console.log(
      `Ready! Logged in as ${client.user.tag}, My ID: ${client.user.id}`
    );
  },
};