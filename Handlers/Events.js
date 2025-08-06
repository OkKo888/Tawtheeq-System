const fs = require("fs");
const ascii = require("ascii-table");
const table = new ascii("Events").setJustify();
const chalk = require("chalk");

module.exports = (client) => {
  fs.readdirSync("./Events/").forEach(dir => {
  const eventFiles = fs.readdirSync(`./Events/${dir}/`).filter(file => file.endsWith(".js"));
  for (const file of eventFiles) {
    try {
      const event = require(`../Events/${dir}/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
        table.addRow(file, chalk.green('🟢 Working'))
      } else {
        client.on(event.name, (...args) => event.execute(...args));
        table.addRow(file, chalk.green('🟢 Working'))
      }
    } catch (error) {
      console.error(`Error loading event file ${file}: ${error}`);
      table.addRow(file, chalk.red('🔴 Not working'));
    }
  }
})
  console.log(table.toString());
}