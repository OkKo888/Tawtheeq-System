const { Events, Collection } = require("discord.js");
const ms = require("ms");
const cooldown = new Collection();

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isChatInputCommand() || interaction.user.bot) return;

    const { client } = interaction;
    const command = client.slashCommands?.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    // التحقق من الصلاحيات
    const roles = command.roles;
    if (roles) {
      const userId = interaction.user.id;
      const member = interaction.member;

      // مالك البوت فقط
      if (roles === "ownerOnly") {
        const ownerId = client.application?.owner?.id || "123456789012345678"; // عيّن ID المالك هنا إذا لم يتوفر
        if (userId !== ownerId) {
          return interaction.reply({
            content: "❌ هذا الأمر مخصص للمالك فقط.",
            ephemeral: true,
          });
        }
      }

      // رتبة محددة
      else if (typeof roles === "string" && roles.startsWith("role:")) {
        const roleId = roles.split(":")[1];
        if (!member.roles.cache.has(roleId)) {
          return interaction.reply({
            content: "❌ ليس لديك الرتبة المطلوبة لاستخدام هذا الأمر.",
            ephemeral: true,
          });
        }
      }

      // مجموعة مستخدمين
      else if (Array.isArray(roles)) {
        if (!roles.includes(userId)) {
          return interaction.reply({
            content: "❌ ليس لديك صلاحية لاستخدام هذا الأمر.",
            ephemeral: true,
          });
        }
      }
    }

    // التبريد
    if (command.cooldown) {
      const key = `${command.name}${interaction.user.id}`;
      if (cooldown.has(key)) {
        const remaining = cooldown.get(key) - Date.now();
        if (remaining > 0) {
          return interaction.reply({
            embeds: [
              {
                description: `**عليك الانتظار \`${ms(remaining, { long: true })
                  .replace("minutes", "دقيقة")
                  .replace("seconds", "ثانية")
                  .replace("second", "ثانية")
                  .replace("ms", "ملي ثانية")}\` لاستخدام الأمر مجددًا.**`,
              },
            ],
            ephemeral: true,
          });
        }
      }

      await command.execute(interaction);
      cooldown.set(key, Date.now() + command.cooldown);
      setTimeout(() => cooldown.delete(key), command.cooldown);
    } else {
      await command.execute(interaction);
    }
  },
};
