const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const client = require("../../index");
const ms = require("ms");
const { EmbedColor } = require("../../Config.json");

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("احصل على مساعدة مع البوت"),

  async execute(interaction) {
    try {
      const slashCommandsPath = path.join(__dirname, "../../SlashCommands");

      // التحقق من وجود مجلد الأوامر
      if (!fs.existsSync(slashCommandsPath)) {
        return await interaction.reply({
          content: "❌ لا يمكن العثور على مجلد الأوامر!",
          ephemeral: true,
        });
      }

      const commandFolders = fs
        .readdirSync(slashCommandsPath)
        .filter((folder) => {
          const folderPath = path.join(slashCommandsPath, folder);
          return fs.statSync(folderPath).isDirectory();
        });

      if (commandFolders.length === 0) {
        return await interaction.reply({
          content: "❌ لا توجد فئات أوامر متاحة!",
          ephemeral: true,
        });
      }

      const commandsByCategory = {};
      const categoryNames = {
        // يمكنك تخصيص أسماء الفئات هنا
        general: "عام",
        moderation: "الإشراف",
        fun: "المرح",
        music: "الموسيقى",
        utility: "المرافق",
        admin: "الإدارة",
      };

      // جمع الأوامر من كل فئة
      for (const folder of commandFolders) {
        const folderPath = path.join(slashCommandsPath, folder);
        const commandFiles = fs
          .readdirSync(folderPath)
          .filter((file) => file.endsWith(".js"));

        const commands = [];

        for (const file of commandFiles) {
          try {
            const filePath = path.join(folderPath, file);
            delete require.cache[require.resolve(filePath)]; // مسح الكاش
            const command = require(filePath);

            if (command?.data?.name && command?.data?.description) {
              commands.push({
                name: command.data.name,
                description: command.data.description,
              });
            }
          } catch (error) {
            console.error(`خطأ في تحميل الأمر ${file}:`, error);
            continue;
          }
        }

        if (commands.length > 0) {
          const categoryDisplayName =
            categoryNames[folder.toLowerCase()] || folder;
          commandsByCategory[categoryDisplayName] = commands;
        }
      }

      // التحقق من وجود أوامر
      if (Object.keys(commandsByCategory).length === 0) {
        return await interaction.reply({
          content: "❌ لا توجد أوامر متاحة حالياً!",
          ephemeral: true,
        });
      }

      // إنشاء خيارات القائمة المنسدلة
      const dropdownOptions = Object.keys(commandsByCategory).map(
        (category, index) => ({
          label: `📁 ${category}`,
          value: category,
          description: `عرض أوامر فئة ${category}`,
          emoji: getEmojiForCategory(category),
        })
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help-menu")
        .setPlaceholder("🔍 اختر فئة لعرض أوامرها...")
        .addOptions(dropdownOptions);

      const embed = new EmbedBuilder()
        .setTitle("📚 مركز المساعدة")
        .setDescription(
          `
        **مرحباً بك في مركز المساعدة!** 
        
        🔹 استخدم القائمة المنسدلة أدناه لاختيار فئة الأوامر
        🔹 إجمالي الفئات المتاحة: **${Object.keys(commandsByCategory).length}**
        🔹 إجمالي الأوامر: **${Object.values(commandsByCategory).reduce(
          (total, commands) => total + commands.length,
          0
        )}**
        
        💡 **نصيحة:** انقر على الفئة التي تريد استكشافها!
        `
        )
        .setColor(EmbedColor || "#00ff00")
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) || null)
        .addFields({
          name: "🔧 الفئات المتاحة",
          value:
            Object.keys(commandsByCategory)
              .map((category) => `• **${category}**`)
              .join("\n") || "لا توجد فئات",
          inline: false,
        })
        .setFooter({
          text: `طلب بواسطة ${interaction.user.tag} • البوت: ${
            client.user?.tag || "غير معروف"
          }`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const actionRow = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [actionRow] });

      // إنشاء مجمع للتفاعلات
      const filter = (i) =>
        i.isStringSelectMenu() &&
        i.customId === "help-menu" &&
        i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: ms("10m"),
        max: 20, // الحد الأقصى للتفاعلات
      });

      collector.on("collect", async (i) => {
        try {
          const selectedCategory = i.values[0];
          const categoryCommands = commandsByCategory[selectedCategory];

          if (!categoryCommands || categoryCommands.length === 0) {
            return await i.update({
              content: "❌ لا توجد أوامر في هذه الفئة!",
              embeds: [],
              components: [],
            });
          }

          const categoryEmbed = new EmbedBuilder()
            .setTitle(`📋 أوامر فئة: ${selectedCategory}`)
            .setColor(EmbedColor || "#0099ff")
            .setDescription(
              `
            **عدد الأوامر في هذه الفئة:** ${categoryCommands.length}
            
            استخدم الأوامر التالية بكتابة \`/\` متبوعة باسم الأمر:
            `
            )
            .setThumbnail(
              client.user?.displayAvatarURL({ dynamic: true }) || null
            )
            .addFields(
              categoryCommands.map((command, index) => ({
                name: `${index + 1}. /${command.name}`,
                value: `📝 ${command.description || "لا يوجد وصف"}`,
                inline: false,
              }))
            )
            .addFields({
              name: "↩️ العودة",
              value: "استخدم القائمة المنسدلة للعودة أو اختيار فئة أخرى",
              inline: false,
            })
            .setFooter({
              text: `الفئة: ${selectedCategory} • طلب بواسطة ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          // إنشاء قائمة جديدة مع إبراز الفئة المحددة
          const updatedOptions = dropdownOptions.map((option) => ({
            ...option,
            default: option.value === selectedCategory,
          }));

          const updatedSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("help-menu")
            .setPlaceholder("🔍 اختر فئة أخرى أو ابق في الفئة الحالية...")
            .addOptions(updatedOptions);

          const updatedActionRow = new ActionRowBuilder().addComponents(
            updatedSelectMenu
          );

          await i.update({
            embeds: [categoryEmbed],
            components: [updatedActionRow],
          });
        } catch (error) {
          console.error("خطأ في معالجة التفاعل:", error);
          await i
            .reply({
              content: "❌ حدث خطأ أثناء معالجة طلبك!",
              ephemeral: true,
            })
            .catch(() => {});
        }
      });

      collector.on("end", async (collected, reason) => {
        try {
          const disabledSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("help-menu-disabled")
            .setPlaceholder("⏰ انتهت مهلة التفاعل...")
            .addOptions({ label: "منتهي الصلاحية", value: "expired" })
            .setDisabled(true);

          const disabledActionRow = new ActionRowBuilder().addComponents(
            disabledSelectMenu
          );

          await interaction.editReply({
            components: [disabledActionRow],
          });
        } catch (error) {
          console.error("خطأ في إنهاء المجمع:", error);
        }
      });
    } catch (error) {
      console.error("خطأ في تنفيذ أمر المساعدة:", error);

      const errorMessage =
        interaction.replied || interaction.deferred
          ? { content: "❌ حدث خطأ غير متوقع!", ephemeral: true }
          : { content: "❌ حدث خطأ غير متوقع!", ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  },
};

// دالة مساعدة لاختيار إيموجي مناسب للفئة
function getEmojiForCategory(category) {
  const emojiMap = {
    عام: "📋",
    الإشراف: "🛡️",
    المرح: "🎮",
    الموسيقى: "🎵",
    المرافق: "🔧",
    الإدارة: "👑",
  };

  return emojiMap[category] || "📁";
}
