const fs = require('fs');
const chalk = require('chalk');

const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const TOKEN = fs.readFileSync('./Token.txt', 'utf8');
const { CLIENT_ID } = require('../Config.json');

const rest = new REST({ version: '10' }).setToken(TOKEN);

module.exports = async (client) => {
  client.slashCommands = new Map()
  const slashCommands = [];
  const ascii = require('ascii-table');
  const table = new ascii('Slash Commands').setJustify();
  for (let folder of fs.readdirSync('./SlashCommands/').filter(folder => !folder.includes('.'))) {
    for (let file of fs.readdirSync('./SlashCommands/' + folder).filter(f => f.endsWith('.js'))) {
      let command = require(`../SlashCommands/${folder}/${file}`);
      if (command) {
        slashCommands.push(command.data.toJSON());
        client.slashCommands.set(command.data.name, {
          ...command,
          data: command.data
        });        
        if (command.data.name) {
          table.addRow(`/${command.data.name}`, chalk.green('🟢 Working'))
        }
        if (!command.data.name) {
          table.addRow(`/${command.data.name}`, chalk.red('🔴 Not Working'))
          continue;
        }
      }
    }
  }

    console.log((table.toString()));

    try {
        await rest.put(
            process.env.GUILD_ID
                ? Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID)
                : Routes.applicationCommands(CLIENT_ID),
            { body: slashCommands }
        );
        console.log(chalk.yellow(`Slash Commands (${slashCommands.length}) • Registered`));
    } catch (error) {
        console.error(error);
    }
};