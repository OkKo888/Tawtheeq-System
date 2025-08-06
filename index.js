const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ApplicationCommandOptionType,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  StringSelectMenuBuilder,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  shards: "auto",
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});
const config = require("./Config.json");
const fs = require("node:fs");
const chalk = require("chalk");
const readline = require("readline");
const mongoose = require("mongoose");
client.setMaxListeners(10000);

mongoose
  .connect(config.mongoose)
  .then(async () => {
    console.log(chalk.green("Login Mongo"));
  })
  .catch(async () => {
    console.log(chalk.red("Bad url Mongo"));
  });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function readToken() {
  rl.question("Enter your token: ", (token) => {
    fs.writeFile("Token.txt", token, (err) => {
      if (err) {
        console.error(chalk.red("Error saving token:"), err);
      } else {
        console.log(chalk.green("Token saved successfully!"));
        rl.close();
        loginWithToken(token);
      }
    });
  });
}

function loginWithToken(token) {
  client.once("ready", () => {
    console.log(chalk.green("Bot is ready!"));
  });

  client.login(token).catch((error) => {
    console.error(chalk.red("Failed to login with token:"), error.message);
  });
}

fs.access("Token.txt", fs.constants.F_OK, (err) => {
  if (err) {
    console.log(
      chalk.yellow("No token found. Please enter your token to log in.")
    );
    readToken();
  } else {
    fs.readFile("Token.txt", "utf8", (err, token) => {
      if (err) {
        console.error(chalk.red("Error reading token file:"), err);
      } else {
        console.log(chalk.green("Token found:", token));
        loginWithToken(token);
      }
    });
  }
});

//handler-source
module.exports = client;
client.aliases = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix;

module.exports = client;
["Events", "Slash"].forEach((handler) => {
  require(`./Handlers/${handler}`)(client);
});

//nodejs-events
process.on("unhandledRejection", (e) => {
  console.log(e);
});
process.on("uncaughtException", (e) => {
  console.log(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
  console.log(e);
});
