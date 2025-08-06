const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Canvas = require("canvas");
const path = require("path");
const fs = require("fs").promises;
const DB = require("../../Schema/users.js");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });

// Helper function to format numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Helper function to draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to draw circular avatar with glowing border
function drawCircularAvatar(
  ctx,
  image,
  x,
  y,
  size,
  borderColor = "#2d184d",
  borderWidth = 3
) {
  // Draw outer glow
  ctx.save();
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2 + borderWidth + 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = borderColor;
  ctx.fill();
  ctx.restore();

  // Draw main border
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + borderWidth, 0, Math.PI * 2);
  ctx.fillStyle = borderColor;
  ctx.fill();

  // Clip for avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw avatar
  ctx.drawImage(image, x, y, size, size);
  ctx.restore();
}

// Helper function to create gradient
function createGradient(ctx, x1, y1, x2, y2, colors) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
}

// Helper function to get status color
function getStatusColor(status) {
  const statusColors = {
    online: "#43b581",
    idle: "#faa61a",
    dnd: "#f04747",
    offline: "#747f8d",
    invisible: "#747f8d",
  };
  return statusColors[status] || statusColors["offline"];
}

// Helper function to draw status indicator with glow
function drawStatusIndicator(ctx, x, y, status, size = 20) {
  const statusColor = getStatusColor(status);

  ctx.save();
  // Glow effect
  ctx.shadowColor = statusColor;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  // White border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// Helper function to draw stats card
function drawStatsCard(ctx, x, y, width, height, title, value, color) {
  // خلفية البطاقة
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, 8);
  const cardGradient = createGradient(ctx, x, y, x, y + height, [
    "rgba(255, 255, 255, 0.1)",
    "rgba(255, 255, 255, 0.05)",
  ]);
  ctx.fillStyle = cardGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // العنوان
  ctx.font = "bold 11px Cairo";
  ctx.fillStyle = "#b9bbbe";
  ctx.textAlign = "left";
  ctx.fillText(title, x + 12, y + 16);

  // الرقم
  ctx.font = "bold 18px Cairo";
  ctx.fillStyle = color;
  ctx.fillText(value, x + 12, y + 35);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("عرض بطاقة المستخدم الشخصية")
    .addUserOption((option) =>
      option
        .setName("المستخدم")
        .setDescription("المستخدم المراد عرض بروفايله")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const blacklistCheck = blackdb.get(`sccblack_${interaction.user.id}`);
    if (blacklistCheck) {
      return interaction.reply({
        content: "❌ لقد تم حظرك من البوت، لا يمكنك استخدام البوت.",
        ephemeral: true,
      });
    }

    try {
      const targetUser =
        interaction.options.getUser("المستخدم") || interaction.user;
      const member = await interaction.guild.members
        .fetch(targetUser.id)
        .catch(() => null);

      // Canvas dimensions - matching the image proportions (more square-like)
      const canvasWidth = 400;
      const canvasHeight = 500;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Load and draw background
      let backgroundPath = path.join(
        __dirname,
        "../../Assets/background.jpg"
      );

      // Try to load user-specific background if exists
      try {
        const userBgPath = path.join(
          __dirname,
          `../../Assets/backgrounds/${targetUser.id}.jpg`
        );
        await fs.access(userBgPath);
        backgroundPath = userBgPath;
      } catch (error) {
        // Use default background
      }

      const background = await Canvas.loadImage(backgroundPath).catch(() => {
        return null;
      });

      if (background) {
        // Draw background with overlay
        ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);
        // Darker overlay for better text visibility
        const overlayGradient = createGradient(
          ctx,
          0,
          0,
          canvasWidth,
          canvasHeight,
          ["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 20, 0.8)"]
        );
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        // Enhanced gradient background
        const gradient = createGradient(ctx, 0, 0, canvasWidth, canvasHeight, [
          "#0f0f23",
          "#1a1a2e",
          "#16213e",
          "#0f3460",
        ]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Draw main card background with glassmorphism effect
      const cardPadding = 15;
      const cardX = cardPadding;
      const cardY = cardPadding;
      const cardWidth = canvasWidth - cardPadding * 2;
      const cardHeight = canvasHeight - cardPadding * 2;

      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
      // Glassmorphism background
      const cardGradient = createGradient(
        ctx,
        cardX,
        cardY,
        cardX + cardWidth,
        cardY + cardHeight,
        ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"]
      );
      ctx.fillStyle = cardGradient;
      ctx.fill();

      // Enhanced border with gradient
      const borderGradient = createGradient(
        ctx,
        cardX,
        cardY,
        cardX + cardWidth,
        cardY,
        ["#2d184d", "#4a2b7a", "#6b3fa0", "#8b5cf6"]
      );
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Load fonts first
      try {
        Canvas.registerFont(
          path.join(__dirname, "../../Assets/fonts/static/Cairo-Bold.ttf"),
          { family: "Cairo" }
        );
        Canvas.registerFont(
          path.join(__dirname, "../../Assets/fonts/static/Cairo-Regular.ttf"),
          { family: "Cairo" }
        );
        Canvas.registerFont(
          path.join(__dirname, "../../Assets/fonts/static/Cairo-Medium.ttf"),
          { family: "Cairo" }
        );
        console.log("Cairo fonts loaded successfully");
      } catch (error) {
        console.log("Font loading error:", error);
        // Fallback to system fonts if custom fonts fail
      }

      // Load and draw avatar with enhanced styling
      const avatarSize = 100;
      const avatarX = cardX + 25;
      const avatarY = cardY + 25;

      try {
        // Get avatar URL
        const avatarUrl = targetUser.displayAvatarURL({
          extension: "png",
          size: 256,
        });

        // Load the avatar
        const avatar = await Canvas.loadImage(avatarUrl);

        // Draw circular avatar with #2d184d border
        drawCircularAvatar(
          ctx,
          avatar,
          avatarX,
          avatarY,
          avatarSize,
          "#2d184d",
          4
        );

        // Apply color overlay to make avatar colors lean towards #2d184d
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "#2d184d";
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Draw status indicator if member exists
        if (member) {
          const statusX = avatarX + avatarSize - 12;
          const statusY = avatarY + avatarSize - 12;
          
          // Get user status - check multiple sources
          // Note: GuildPresences intent must be enabled in index.js for presence to work
          let userStatus = "offline";
          
          if (member.presence && member.presence.status) {
            userStatus = member.presence.status;
          } else if (member.user.bot) {
            userStatus = "online"; // Bots are usually online
          } else {
            // Try to get status from client cache
            const cachedPresence = interaction.client.guilds.cache
              .get(interaction.guild.id)
              ?.presences?.cache?.get(member.id);
            
            if (cachedPresence && cachedPresence.status) {
              userStatus = cachedPresence.status;
            }
          }
          
          drawStatusIndicator(ctx, statusX, statusY, userStatus, 22);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
        // Simple placeholder with #2d184d theme
        ctx.save();
        drawRoundedRect(
          ctx,
          avatarX,
          avatarY,
          avatarSize,
          avatarSize,
          avatarSize / 2
        );
        const placeholderGradient = createGradient(
          ctx,
          avatarX,
          avatarY,
          avatarX + avatarSize,
          avatarY + avatarSize,
          ["#2d184d", "#1a0f2e"]
        );
        ctx.fillStyle = placeholderGradient;
        ctx.fill();
        ctx.restore();
      }

      // User information area with enhanced styling
      const infoX = avatarX + avatarSize + 20;
      const infoY = avatarY + 15;

      // Username with enhanced glow effect
      ctx.font = "bold 24px Cairo";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";

      const username = targetUser.username;
      const displayName = targetUser.displayName || username;

      // Enhanced shadow effect
      ctx.save();
      ctx.shadowColor = "#2d184d";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText(username, infoX, infoY);
      ctx.restore();

      // User ID with better styling
      ctx.font = "12px Cairo";
      ctx.fillStyle = "#8e9297";
      ctx.fillText(`ID: ${targetUser.id}`, infoX, infoY + 20);

      // Stats section with cards - arranged horizontally
      const statsY = avatarY + avatarSize + 25;
      const cardSpacing = 12;
      const cardW = 110;
      const cardH = 50;

      // Get user balance from database
      const userDB = await DB.findOne({ userid: targetUser.id });
      const userBalance = userDB ? (parseInt(userDB.balance) || 0) : 0;

      // Coins card
      drawStatsCard(
        ctx,
        cardX + 10,
        statsY,
        cardW,
        cardH,
        "الكوينات",
        formatNumber(userBalance),
        "#ffd700"
      );

      // Services card
      drawStatsCard(
        ctx,
        cardX + 10 + cardW + cardSpacing,
        statsY,
        cardW,
        cardH,
        "الخدمات",
        formatNumber(0),
        "#4a2b7a"
      );

      // Rank card
      drawStatsCard(
        ctx,
        cardX + 10 + (cardW + cardSpacing) * 2,
        statsY,
        cardW,
        cardH,
        "المستوي",
        "مستوى 1",
        "#ff6b6b"
      );

      // Account creation date with card style
      const dateCardY = statsY + cardH + 25;
      const dateCardW = cardW;
      const dateCardH = 50;

      // Creation date card (left)
      ctx.save();
      drawRoundedRect(ctx, cardX + 10, dateCardY, dateCardW, dateCardH, 8);
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.font = "bold 12px Cairo";
      ctx.fillStyle = "#b9bbbe";
      ctx.textAlign = "center";

      const createdDate = targetUser.createdAt.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      ctx.fillText("تاريخ الإنشاء", cardX + 10 + dateCardW / 2, dateCardY + 17);
      ctx.font = "11px Cairo";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(createdDate, cardX + 10 + dateCardW / 2, dateCardY + 37);

      // Join date if member exists (right)
      if (member) {
        ctx.save();
        drawRoundedRect(ctx, cardX + 10 + cardW + cardSpacing, dateCardY, dateCardW, dateCardH, 8);
        ctx.fillStyle = "rgba(87, 242, 135, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(87, 242, 135, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        ctx.font = "bold 12px Cairo";
        ctx.fillStyle = "#57f287";
        const joinDate = member.joinedAt.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        ctx.fillText("انضم في", cardX + 10 + cardW + cardSpacing + dateCardW / 2, dateCardY + 17);
        ctx.font = "11px Cairo";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(joinDate, cardX + 10 + cardW + cardSpacing + dateCardW / 2, dateCardY + 37);
      }

      // Server boost status with enhanced styling (below the date cards)
      if (member && member.premiumSince) {
        const boostCardY = dateCardY + dateCardH + 15;
        const boostCardW = cardWidth - 20;
        const boostCardH = 45;
        
        ctx.save();
        drawRoundedRect(ctx, cardX + 10, boostCardY, boostCardW, boostCardH, 8);
        ctx.fillStyle = "rgba(255, 115, 250, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "#ff73fa";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.font = "bold 13px Cairo";
        ctx.fillStyle = "#ff73fa";
        ctx.fillText(
          "🚀 معزز السيرفر",
          canvasWidth / 2,
          boostCardY + 28
        );
      }

      // Experience bar at the bottom
      const expBarY = canvasHeight - 70;
      const expBarWidth = cardWidth - 40;
      const expBarHeight = 8;
      const expBarX = cardX + 20;

      // Background bar
      ctx.save();
      drawRoundedRect(ctx, expBarX, expBarY, expBarWidth, expBarHeight, expBarHeight / 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
      ctx.restore();

      // Progress bar (example: 70% progress)
      const progress = 0.7; // You can calculate this based on user data
      const progressWidth = expBarWidth * progress;
      ctx.save();
      drawRoundedRect(ctx, expBarX, expBarY, progressWidth, expBarHeight, expBarHeight / 2);
      const progressGradient = createGradient(ctx, expBarX, expBarY, expBarX + progressWidth, expBarY, [
        "#4a2b7a",
        "#6b3fa0"
      ]);
      ctx.fillStyle = progressGradient;
      ctx.fill();
      ctx.restore();

      // Progress text
      ctx.font = "bold 12px Cairo";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("71944 / Max", canvasWidth / 2, expBarY - 5);

      // Total XP text
      ctx.font = "10px Cairo";
      ctx.fillStyle = "#b9bbbe";
      ctx.fillText("TOTAL XP: 1021944", canvasWidth / 2, expBarY + expBarHeight + 15);

      // Small icon in top right corner
      ctx.save();
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(canvasWidth - 25, cardY + 20, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = "bold 8px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("T", canvasWidth - 25, cardY + 25);
      ctx.restore();

      // Corner decorative elements
      ctx.save();
      ctx.fillStyle = "#2d184d50";
      ctx.beginPath();
      ctx.arc(cardX + 15, cardY + 15, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cardX + cardWidth - 15, cardY + 15, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Convert canvas to buffer
      const attachment = canvas.toBuffer("image/png");
      const file = new AttachmentBuilder(attachment, {
        name: `${targetUser.username}_profile.png`,
      });

      // Simple response with just the image
      await interaction.editReply({
        files: [file],
      });
    } catch (error) {
      console.error("Error in profile command:", error);

      await interaction.editReply({
        content:
          "❌ **خطأ:** حدث خطأ أثناء إنشاء بطاقة البروفايل. يرجى المحاولة مرة أخرى.",
      });
    }
  },
};
