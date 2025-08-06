const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ComponentType 
} = require("discord.js");
const DB = require("../../Schema/users.js");
const { EmbedColor } = require('../../Config.json');

// Constants
const LEADERBOARD_CONFIG = {
  USERS_PER_PAGE: 10,
  MAX_PAGES: 10,
  TIMEOUT: 60000, // 1 minute
  MIN_BALANCE_TO_SHOW: 0
};

const MESSAGES = {
  NO_USERS: "**لا يوجد أعضاء في قاعدة البيانات**",
  NO_USERS_WITH_BALANCE: "**لا يوجد أعضاء لديهم رصيد**",
  LEADERBOARD_TITLE: "🏆 **قائمة الأعضاء حسب الرصيد**",
  YOUR_RANK: "ترتيبك",
  YOUR_BALANCE: "رصيدك",
  TOTAL_USERS: "إجمالي الأعضاء",
  PAGE_INFO: "الصفحة {current} من {total}",
  UPDATED_AT: "آخر تحديث"
};

const EMOJIS = {
  FIRST: "🥇",
  SECOND: "🥈", 
  THIRD: "🥉",
  CROWN: "👑",
  COIN: "💰",
  USERS: "👥",
  ARROW_LEFT: "⬅️",
  ARROW_RIGHT: "➡️",
  REFRESH: "🔄"
};

module.exports = {
  roles: "role:1399012282574438541",
  data: new SlashCommandBuilder()
      .setName('top')
      .setDescription('عرض قائمة الأعضاء مرتبة حسب الرصيد')
      .addIntegerOption(option => option
          .setName('page')
          .setDescription('رقم الصفحة المراد عرضها')
          .setMinValue(1)
          .setMaxValue(LEADERBOARD_CONFIG.MAX_PAGES)),

  async execute(interaction) {
      try {
          await interaction.deferReply();
          
          const requestedPage = interaction.options.getInteger('page') || 1;
          
          // Get leaderboard data
          const leaderboardData = await getLeaderboardData(interaction.user.id);
          
          if (!leaderboardData.users.length) {
              const noUsersEmbed = createBaseEmbed(interaction);
              noUsersEmbed.setTitle(MESSAGES.NO_USERS_WITH_BALANCE);
              noUsersEmbed.setDescription("لا يوجد أعضاء لديهم رصيد حالياً");
              return interaction.editReply({ embeds: [noUsersEmbed] });
          }

          // Calculate pagination
          const totalPages = Math.ceil(leaderboardData.users.length / LEADERBOARD_CONFIG.USERS_PER_PAGE);
          const currentPage = Math.min(requestedPage, totalPages);
          
          // Create initial embed and components
          const embed = createLeaderboardEmbed(interaction, leaderboardData, currentPage);
          const components = createNavigationComponents(currentPage, totalPages);
          
          const message = await interaction.editReply({ 
              embeds: [embed], 
              components: components.length ? [components] : []
          });

          // Handle pagination if there are multiple pages
          if (totalPages > 1) {
              await handlePagination(interaction, message, leaderboardData, totalPages);
          }

      } catch (error) {
          console.error('Top command error:', error);
          const errorEmbed = createErrorEmbed(interaction, "**حدث خطأ أثناء جلب قائمة الأعضاء**");
          await interaction.editReply({ embeds: [errorEmbed], components: [] });
      }
  }
};

// Get leaderboard data from database
async function getLeaderboardData(userId) {
  try {
      // Get all users sorted by balance (ascending - lowest first)
      const allUsers = await DB.find({ 
          balance: { $gt: LEADERBOARD_CONFIG.MIN_BALANCE_TO_SHOW } 
      }).sort({ balance: 1 });
      
      // Find current user's rank
      let userRank = null;
      let userBalance = 0;
      
      const userIndex = allUsers.findIndex(user => user.userid === userId);
      if (userIndex !== -1) {
          userRank = userIndex + 1;
          userBalance = allUsers[userIndex].balance;
      }
      
      return {
          users: allUsers,
          currentUserRank: userRank,
          currentUserBalance: userBalance,
          totalUsers: allUsers.length
      };
      
  } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return {
          users: [],
          currentUserRank: null,
          currentUserBalance: 0,
          totalUsers: 0
      };
  }
}

// Create leaderboard embed
function createLeaderboardEmbed(interaction, data, page) {
  const embed = createBaseEmbed(interaction);
  
  const startIndex = (page - 1) * LEADERBOARD_CONFIG.USERS_PER_PAGE;
  const endIndex = Math.min(startIndex + LEADERBOARD_CONFIG.USERS_PER_PAGE, data.users.length);
  const pageUsers = data.users.slice(startIndex, endIndex);
  
  embed.setTitle(MESSAGES.LEADERBOARD_TITLE);
  
  // Add description with stats
  const totalPages = Math.ceil(data.users.length / LEADERBOARD_CONFIG.USERS_PER_PAGE);
  let description = `${EMOJIS.USERS} **${MESSAGES.TOTAL_USERS}:** ${data.totalUsers}\n`;
  
  if (data.currentUserRank) {
      description += `${EMOJIS.CROWN} **${MESSAGES.YOUR_RANK}:** #${data.currentUserRank}\n`;
      description += `${EMOJIS.COIN} **${MESSAGES.YOUR_BALANCE}:** ${formatNumber(data.currentUserBalance)}\n`;
  }
  
  description += `\n📄 **${MESSAGES.PAGE_INFO.replace('{current}', page).replace('{total}', totalPages)}**`;
  embed.setDescription(description);
  
  // Add users to embed
  pageUsers.forEach((user, index) => {
      const globalRank = startIndex + index + 1;
      const rankEmoji = getRankEmoji(globalRank);
      const balance = parseInt(user.balance) || 0;
      
      embed.addFields({
          name: `${rankEmoji} **#${globalRank} - ${user.username || 'مستخدم غير معروف'}**`,
          value: `${EMOJIS.COIN} **${formatNumber(balance)}**`,
          inline: true
      });
  });
  
  // Add timestamp
  embed.setFooter({
      text: `${MESSAGES.UPDATED_AT} • ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
  });
  
  return embed;
}

// Create navigation components
function createNavigationComponents(currentPage, totalPages) {
  if (totalPages <= 1) return [];
  
  const row = new ActionRowBuilder();
  
  // Previous button
  row.addComponents(
      new ButtonBuilder()
          .setCustomId('leaderboard_prev')
          .setLabel('السابق')
          .setEmoji(EMOJIS.ARROW_LEFT)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 1)
  );
  
  // Page info button (disabled)
  row.addComponents(
      new ButtonBuilder()
          .setCustomId('leaderboard_info')
          .setLabel(`${currentPage}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
  );
  
  // Next button
  row.addComponents(
      new ButtonBuilder()
          .setCustomId('leaderboard_next')
          .setLabel('التالي')
          .setEmoji(EMOJIS.ARROW_RIGHT)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages)
  );
  
  // Refresh button
  row.addComponents(
      new ButtonBuilder()
          .setCustomId('leaderboard_refresh')
          .setLabel('تحديث')
          .setEmoji(EMOJIS.REFRESH)
          .setStyle(ButtonStyle.Success)
  );
  
  return row;
}

// Handle pagination interactions
async function handlePagination(interaction, message, initialData, totalPages) {
  const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: LEADERBOARD_CONFIG.TIMEOUT,
      filter: i => i.user.id === interaction.user.id
  });
  
  let currentPage = 1;
  let currentData = initialData;
  
  collector.on('collect', async (buttonInteraction) => {
      try {
          await buttonInteraction.deferUpdate();
          
          switch (buttonInteraction.customId) {
              case 'leaderboard_prev':
                  if (currentPage > 1) currentPage--;
                  break;
                  
              case 'leaderboard_next':
                  if (currentPage < totalPages) currentPage++;
                  break;
                  
              case 'leaderboard_refresh':
                  // Refresh data
                  currentData = await getLeaderboardData(interaction.user.id);
                  if (!currentData.users.length) {
                      const noUsersEmbed = createBaseEmbed(interaction);
                      noUsersEmbed.setTitle(MESSAGES.NO_USERS_WITH_BALANCE);
                      return buttonInteraction.editReply({ 
                          embeds: [noUsersEmbed], 
                          components: [] 
                      });
                  }
                  // Recalculate total pages
                  totalPages = Math.ceil(currentData.users.length / LEADERBOARD_CONFIG.USERS_PER_PAGE);
                  currentPage = Math.min(currentPage, totalPages);
                  break;
          }
          
          // Update embed and components
          const updatedEmbed = createLeaderboardEmbed(interaction, currentData, currentPage);
          const updatedComponents = createNavigationComponents(currentPage, totalPages);
          
          await buttonInteraction.editReply({
              embeds: [updatedEmbed],
              components: updatedComponents.length ? [updatedComponents] : []
          });
          
      } catch (error) {
          console.error('Pagination error:', error);
      }
  });
  
  collector.on('end', async () => {
      try {
          // Disable all buttons when collector ends
          const disabledComponents = createDisabledComponents();
          await message.edit({ 
              components: disabledComponents.length ? [disabledComponents] : []
          });
      } catch (error) {
          console.error('Error disabling components:', error);
      }
  });
}

// Create disabled components for timeout
function createDisabledComponents() {
  const row = new ActionRowBuilder();
  
  row.addComponents(
      new ButtonBuilder()
          .setCustomId('leaderboard_expired')
          .setLabel('انتهت صلاحية التفاعل')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
  );
  
  return row;
}

// Utility functions
function createBaseEmbed(interaction) {
  return new EmbedBuilder()
      .setColor(EmbedColor)
      .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();
}

function createErrorEmbed(interaction, message) {
  const embed = createBaseEmbed(interaction);
  embed.setTitle(message);
  embed.setColor('#ff0000');
  return embed;
}

function getRankEmoji(rank) {
  switch (rank) {
      case 1: return EMOJIS.FIRST;
      case 2: return EMOJIS.SECOND;
      case 3: return EMOJIS.THIRD;
      default: return `**${rank}.**`;
  }
}

function formatNumber(num) {
  return new Intl.NumberFormat('ar-EG').format(num);
}