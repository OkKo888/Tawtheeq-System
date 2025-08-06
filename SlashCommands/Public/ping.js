const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { EmbedColor } = require("../../Config.json");
const client = require("../../index");

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار سرعة استجابة البوت والاتصال"),

  async execute(interaction) {
    try {
      // التحقق من صلاحيات المستخدم
      const isAdmin = interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);

      // إرسال رسالة أولية
      const sent = await interaction.reply({
        content: "🔄 جاري قياس سرعة الاستجابة...",
        fetchReply: true,
      });

      // حساب أوقات الاستجابة المختلفة
      const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const websocketHeartbeat = client.ws.ping;

      // تحديد حالة الاتصال بناءً على سرعة الاستجابة
      function getConnectionStatus(ping) {
        if (ping < 100) return { status: "ممتاز", emoji: "🟢", color: "#00ff00" };
        if (ping < 200) return { status: "جيد", emoji: "🟡", color: "#ffff00" };
        if (ping < 500) return { status: "متوسط", emoji: "🟠", color: "#ff8800" };
        return { status: "ضعيف", emoji: "🔴", color: "#ff0000" };
      }

      function getWebSocketStatus(ping) {
        if (ping < 50) return { status: "ممتاز", emoji: "🟢" };
        if (ping < 150) return { status: "جيد", emoji: "🟡" };
        if (ping < 300) return { status: "متوسط", emoji: "🟠" };
        return { status: "ضعيف", emoji: "🔴" };
      }

      const roundTripStatus = getConnectionStatus(roundTripLatency);
      const wsStatus = getWebSocketStatus(websocketHeartbeat);

      // إنشاء شريط تقدم بصري للبينغ
      function createProgressBar(value, max = 500) {
        const percentage = Math.min(value / max, 1);
        const filledBars = Math.round(percentage * 10);
        const emptyBars = 10 - filledBars;
        return "█".repeat(filledBars) + "░".repeat(emptyBars);
      }

      // الرسالة المبسطة للمستخدمين العاديين
      if (!isAdmin) {
        const simpleEmbed = new EmbedBuilder()
          .setTitle("📡 سرعة الاستجابة")
          .setDescription("معلومات أساسية عن أداء البوت")
          .setColor(roundTripStatus.color)
          .addFields([
            {
              name: "⚡ زمن الاستجابة",
              value: `${roundTripStatus.emoji} **${roundTripLatency}ms** - ${roundTripStatus.status}`,
              inline: true,
            },
            {
              name: "🌐 اتصال الويب سوكت",
              value: `${wsStatus.emoji} **${websocketHeartbeat}ms** - ${wsStatus.status}`,
              inline: true,
            },
            {
              name: "📊 الحالة العامة",
              value: `${
                roundTripLatency < 200 && websocketHeartbeat < 150
                  ? "✅ مستقر"
                  : "⚠️ بحاجة مراقبة"
              }`,
              inline: true,
            },
          ])
          .addFields({
            name: "📊 مخطط الأداء",
            value: `
            \`${createProgressBar(roundTripLatency)} ${roundTripLatency}ms\`
            ${
              roundTripLatency < 100
                ? "🚀 سريع جداً!"
                : roundTripLatency < 200
                ? "⭐ أداء جيد"
                : roundTripLatency < 500
                ? "⚠️ بحاجة تحسين"
                : "🐌 بطيء جداً"
            }
            `,
            inline: false,
          })
          .setFooter({
            text: `طلب بواسطة ${interaction.user.username} • ${new Date().toLocaleString("ar-EG", {
              timeZone: "Africa/Cairo",
              year: "numeric",
              month: "short", 
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await interaction.editReply({
          content: null,
          embeds: [simpleEmbed],
        });
        return;
      }

      // الرسالة المفصلة للإداريين
      const botUptime = process.uptime();
      const uptimeHours = Math.floor(botUptime / 3600);
      const uptimeMinutes = Math.floor((botUptime % 3600) / 60);
      const uptimeSeconds = Math.floor(botUptime % 60);

      // حساب إحصائيات إضافية للإداريين
      const memoryUsage = process.memoryUsage();
      const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      // معلومات عن الخوادم والمستخدمين (للإداريين فقط)
      const guildCount = client.guilds.cache.size;
      const userCount = client.users.cache.size;
      const channelCount = client.channels.cache.size;

      const adminEmbed = new EmbedBuilder()
        .setTitle("📡 تقرير سرعة الاستجابة المفصل")
        .setDescription("معلومات شاملة عن أداء البوت والنظام - *عرض الإدارة*")
        .setColor(roundTripStatus.color)
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) || null)
        .addFields([
          {
            name: "⚡ زمن الاستجابة",
            value: `${roundTripStatus.emoji} **${roundTripLatency}ms** - ${roundTripStatus.status}`,
            inline: true,
          },
          {
            name: "🌐 اتصال الويب سوكت",
            value: `${wsStatus.emoji} **${websocketHeartbeat}ms** - ${wsStatus.status}`,
            inline: true,
          },
          {
            name: "📊 الحالة العامة",
            value: `${
              roundTripLatency < 200 && websocketHeartbeat < 150
                ? "✅ مستقر"
                : "⚠️ بحاجة مراقبة"
            }`,
            inline: true,
          },
          {
            name: "⏱️ مدة التشغيل",
            value: `🕒 ${uptimeHours}س ${uptimeMinutes}د ${uptimeSeconds}ث`,
            inline: true,
          },
          {
            name: "🖥️ الخادم الحالي",
            value: `📍 ${interaction.guild?.name || "غير محدد"}`,
            inline: true,
          },
          {
            name: "👤 طالب الأمر",
            value: `${interaction.user.tag}`,
            inline: true,
          },
        ])
        .addFields({
          name: "📊 مخطط سرعة الاستجابة",
          value: `
          \`${createProgressBar(roundTripLatency)} ${roundTripLatency}ms\`
          ${
            roundTripLatency < 100
              ? "🚀 سريع جداً!"
              : roundTripLatency < 200
              ? "⭐ أداء جيد"
              : roundTripLatency < 500
              ? "⚠️ بحاجة تحسين"
              : "🐌 بطيء جداً"
          }
          `,
          inline: false,
        })
        .addFields({
          name: "🔧 معلومات تقنية متقدمة",
          value: `
          \`\`\`yaml
          معرف البوت: ${client.user?.id || "غير محدد"}
          إصدار Discord.js: v${require("discord.js").version}
          إصدار Node.js: ${process.version}
          نظام التشغيل: ${process.platform} ${process.arch}
          معرف العملية: ${process.pid}
          \`\`\`
          `,
          inline: false,
        })
        .addFields({
          name: "💾 استخدام الذاكرة",
          value: `
          \`\`\`diff
          + المستخدمة: ${usedMemory}MB
          + الإجمالية: ${totalMemory}MB  
          + النسبة: ${memoryPercentage}%
          ${memoryPercentage > 80 ? "- تحذير: استخدام عالي للذاكرة!" : ""}
          \`\`\`
          `,
          inline: true,
        })
        .addFields({
          name: "📈 إحصائيات البوت",
          value: `
          \`\`\`yaml
          الخوادم: ${guildCount}
          المستخدمين: ${userCount}
          القنوات: ${channelCount}
          \`\`\`
          `,
          inline: true,
        })
        .addFields({
          name: "🔍 معلومات الشبكة",
          value: `
          \`\`\`ini
          [Latency] ${roundTripLatency}ms
          [WebSocket] ${websocketHeartbeat}ms
          [Status] ${client.ws.status === 0 ? "متصل" : "غير متصل"}
          [Ready] ${client.readyTimestamp ? "نعم" : "لا"}
          \`\`\`
          `,
          inline: false,
        })
        .setFooter({
          text: `طلب بواسطة المدير ${interaction.user.username} • ${new Date().toLocaleString("ar-EG", {
            timeZone: "Africa/Cairo",
            year: "numeric",
            month: "short",
            day: "numeric", 
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({
          name: `${interaction.guild?.name || "الخادم"} - تقرير الأداء المتقدم`,
          iconURL:
            interaction.guild?.iconURL({ dynamic: true }) ||
            client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      // تحديث الرسالة بالنتائج النهائية
      await interaction.editReply({
        content: null,
        embeds: [adminEmbed],
      });

    } catch (error) {
      console.error("خطأ في تنفيذ أمر البينغ:", error);

      // رسالة خطأ محسّنة
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ خطأ في قياس سرعة الاستجابة")
        .setDescription(
          "حدث خطأ غير متوقع أثناء قياس سرعة الاستجابة. يرجى المحاولة مرة أخرى بعد قليل."
        )
        .setColor("#ff0000")
        .addFields({
          name: "🔧 معلومات الخطأ",
          value: `\`\`\`\nرمز الخطأ: ${error.code || "غير محدد"}\nالوقت: ${new Date().toLocaleString("ar-EG")}\n\`\`\``,
          inline: false,
        })
        .setFooter({
          text: `طلب بواسطة ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      // التحقق من حالة التفاعل قبل الرد
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            content: null,
            embeds: [errorEmbed],
          });
        } else {
          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error("خطأ في إرسال رسالة الخطأ:", replyError);
      }
    }
  },
};