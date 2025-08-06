const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");
const DB = require("../../Schema/users.js");
const { CaptchaGenerator } = require("captcha-canvas");
const { EmbedColor } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

// Constants for better maintainability
const CAPTCHA_CONFIG = {
  HEIGHT: 200,
  WIDTH: 600,
  TEXT_SIZE: 50,
  TIMEOUT: 30000, // 30 seconds
  MIN_NUMBER: 10000,
  MAX_NUMBER: 99999,
};

const MESSAGES = {
  INSUFFICIENT_BALANCE: "**رصيدك غير كافي لإتمام العملية**",
  TRANSFER_SUCCESS: "**تم إتمام العملية بنجاح**",
  VERIFICATION_TIMEOUT: "**انتهى وقت التحقق**",
  TRY_AGAIN: "**الرجاء المحاولة مرة أخرى**",
  CAPTCHA_PROMPT: "**قم بكتابة الأرقام في الصورة لتأكيد التحويل.**",
  WRONG_CAPTCHA: "**الرمز المدخل غير صحيح، يرجى المحاولة مرة أخرى**",
  SELF_TRANSFER: "**لا يمكنك تحويل الرصيد لنفسك**",
  INVALID_AMOUNT: "**يجب أن يكون المبلغ أكبر من 0**",
  BOT_TRANSFER: "**لا يمكن تحويل الرصيد للبوتات**",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("تحويل رصيد إلى شخص آخر")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("الشخص المراد التحويل إليه")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("المبلغ المراد تحويله")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    try {
      const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
      if (blacklistCheck) {
        return interaction.reply({
          content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ fetchReply: true, ephemeral: false });

      const targetUser = interaction.options.getUser("user");
      const transferAmount = interaction.options.getInteger("amount");

      // Input validation
      const validationResult = await validateTransferRequest(
        interaction,
        targetUser,
        transferAmount
      );
      if (!validationResult.isValid) {
        return interaction.editReply({ embeds: [validationResult.embed] });
      }

      const { senderInfo, receiverInfo } = validationResult;

      // Generate and send CAPTCHA
      const captchaData = await generateCaptcha();
      const captchaEmbed = createCaptchaEmbed(interaction);
      const captchaAttachment = new AttachmentBuilder(
        captchaData.buffer,
        "captcha.png"
      );

      const msg = await interaction.editReply({
        embeds: [captchaEmbed],
        files: [captchaAttachment],
      });

      // Handle CAPTCHA verification
      await handleCaptchaVerification(interaction, msg, captchaData.text, {
        senderInfo,
        receiverInfo,
        targetUser,
        transferAmount,
      });
    } catch (error) {
      console.error("Transfer command error:", error);
      const errorEmbed = createErrorEmbed(
        interaction,
        "**حدث خطأ أثناء معالجة طلبك**"
      );
      await interaction.editReply({ embeds: [errorEmbed], files: [] });
    }
  },
};

// Validation functions
async function validateTransferRequest(
  interaction,
  targetUser,
  transferAmount
) {
  const embed = createBaseEmbed(interaction);

  // Check if user is trying to transfer to themselves
  if (targetUser.id === interaction.user.id) {
    embed.setTitle(MESSAGES.SELF_TRANSFER);
    return { isValid: false, embed };
  }

  // Check if target is a bot
  if (targetUser.bot) {
    embed.setTitle(MESSAGES.BOT_TRANSFER);
    return { isValid: false, embed };
  }

  // Check if amount is valid
  if (transferAmount <= 0) {
    embed.setTitle(MESSAGES.INVALID_AMOUNT);
    return { isValid: false, embed };
  }

  // Get or create sender info
  let senderInfo = await DB.findOne({ userid: interaction.user.id });
  if (!senderInfo) {
    senderInfo = await new DB({
      userid: interaction.user.id,
      username: interaction.user.username,
      balance: 0,
    }).save();
  }

  // Check if sender has sufficient balance
  const senderBalance = parseInt(senderInfo.balance) || 0;
  if (senderBalance < transferAmount) {
    embed.setTitle(MESSAGES.INSUFFICIENT_BALANCE);
    embed.addFields([
      { name: "رصيدك الحالي", value: `${senderBalance}`, inline: true },
      { name: "المبلغ المطلوب", value: `${transferAmount}`, inline: true },
    ]);
    return { isValid: false, embed };
  }

  // Get or create receiver info
  let receiverInfo = await DB.findOne({ userid: targetUser.id });
  if (!receiverInfo) {
    receiverInfo = new DB({
      userid: targetUser.id,
      username: targetUser.username,
      balance: 0,
    });
  }

  return {
    isValid: true,
    senderInfo,
    receiverInfo,
  };
}

// CAPTCHA generation
async function generateCaptcha() {
  const captchaText = getRandomInt(
    CAPTCHA_CONFIG.MIN_NUMBER,
    CAPTCHA_CONFIG.MAX_NUMBER
  ).toString();
  const options = {
    height: CAPTCHA_CONFIG.HEIGHT,
    width: CAPTCHA_CONFIG.WIDTH,
  };

  const captcha = new CaptchaGenerator(options)
    .setCaptcha({
      text: captchaText,
      size: CAPTCHA_CONFIG.TEXT_SIZE,
      color: EmbedColor,
    })
    .setTrace({ color: EmbedColor });

  const buffer = await captcha.generate();

  return {
    text: captchaText,
    buffer: buffer,
  };
}

// CAPTCHA verification handler
async function handleCaptchaVerification(
  interaction,
  msg,
  captchaText,
  transferData
) {
  const { senderInfo, receiverInfo, targetUser, transferAmount } = transferData;

  const filter = (m) =>
    m.author.id === interaction.user.id &&
    m.channel.id === interaction.channel.id;
  const collectorOptions = {
    max: 1,
    time: CAPTCHA_CONFIG.TIMEOUT,
    errors: ["time"],
  };

  const collector = interaction.channel.createMessageCollector({
    filter,
    ...collectorOptions,
  });

  collector.on("collect", async (collectedMessage) => {
    try {
      const userResponse = collectedMessage.content.trim();
      await collectedMessage.delete().catch(() => {});

      if (userResponse === captchaText) {
        // Process the transfer
        await processTransfer(interaction, {
          senderInfo,
          receiverInfo,
          targetUser,
          transferAmount,
        });
      } else {
        // Wrong CAPTCHA
        const wrongEmbed = createBaseEmbed(interaction);
        wrongEmbed.setTitle(MESSAGES.WRONG_CAPTCHA);
        await interaction.editReply({ embeds: [wrongEmbed], files: [] });
      }
    } catch (error) {
      console.error("Error processing collected message:", error);
    }

    collector.stop();
  });

  collector.on("end", async (collected) => {
    if (collected.size === 0) {
      // Timeout occurred
      try {
        await msg.delete().catch(() => {});
        const timeoutEmbed = createBaseEmbed(interaction);
        timeoutEmbed.setTitle(MESSAGES.VERIFICATION_TIMEOUT);
        timeoutEmbed.setDescription(MESSAGES.TRY_AGAIN);
        await interaction.editReply({ embeds: [timeoutEmbed], files: [] });
      } catch (error) {
        console.error("Error handling timeout:", error);
      }
    }
  });
}

// Transfer processing
async function processTransfer(
  interaction,
  { senderInfo, receiverInfo, targetUser, transferAmount }
) {
  try {
    // Convert to numbers to ensure proper arithmetic operations
    const senderCurrentBalance = parseInt(senderInfo.balance) || 0;
    const receiverCurrentBalance = parseInt(receiverInfo.balance) || 0;
    const amount = parseInt(transferAmount);

    // Update balances with proper arithmetic
    senderInfo.balance = senderCurrentBalance - amount;

    if (receiverInfo.userid) {
      // Existing user
      receiverInfo.balance = receiverCurrentBalance + amount;
      await receiverInfo.save();
    } else {
      // New user
      receiverInfo.balance = amount;
      await receiverInfo.save();
    }

    await senderInfo.save();

    // Create success embed
    const successEmbed = createBaseEmbed(interaction);
    successEmbed.setTitle(MESSAGES.TRANSFER_SUCCESS);
    successEmbed.setDescription(
      `**تم تحويل \`${transferAmount}\` إلى ${targetUser}**`
    );
    successEmbed.addFields([
      {
        name: "رصيدك الجديد",
        value: `${parseInt(senderInfo.balance)}`,
        inline: true,
      },
      {
        name: "المستلم",
        value: `${targetUser.username}`,
        inline: true,
      },
      {
        name: "المبلغ المحول",
        value: `${parseInt(transferAmount)}`,
        inline: true,
      },
    ]);
    successEmbed.setColor(EmbedColor);

    await interaction.editReply({ embeds: [successEmbed], files: [] });

    // Log the transaction (optional)
    console.log(
      `Transfer completed: ${interaction.user.username} -> ${targetUser.username}, Amount: ${transferAmount}`
    );
  } catch (error) {
    console.error("Error processing transfer:", error);
    const errorEmbed = createErrorEmbed(
      interaction,
      "**حدث خطأ أثناء معالجة التحويل**"
    );
    await interaction.editReply({ embeds: [errorEmbed], files: [] });
  }
}

// Utility functions
function createBaseEmbed(interaction) {
  return new EmbedBuilder()
    .setFooter({
      text: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setAuthor({
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true }),
    })
    .setTimestamp(Date.now())
    .setColor(EmbedColor);
}

function createCaptchaEmbed(interaction) {
  const embed = createBaseEmbed(interaction);
  embed.setDescription(MESSAGES.CAPTCHA_PROMPT);
  embed.setImage("attachment://captcha.png");
  return embed;
}

function createErrorEmbed(interaction, message) {
  const embed = createBaseEmbed(interaction);
  embed.setTitle(message);
  embed.setColor("#ff0000"); // Red color for errors
  return embed;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
