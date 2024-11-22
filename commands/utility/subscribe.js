const { SlashCommandBuilder } = require('discord.js');
const { subscribeToUser, unsubscribeFromUser } = require('../../onlineNotifier.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Manage notifications for a user\'s activity')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Subscribe to notifications for a user.')
        .addUserOption((option) =>
          option.setName('user').setDescription('The user to track').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Unsubscribe from notifications for a user.')
        .addUserOption((option) =>
          option.setName('user').setDescription('The user to stop tracking').setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');

    if (subcommand === 'add') {
      subscribeToUser(user.id, interaction.channelId);
      await interaction.reply(`✅ Subscribed to notifications for <@${user.id}> in this channel.`);
    } else if (subcommand === 'remove') {
      unsubscribeFromUser(user.id, interaction.channelId);
      await interaction.reply(`❌ Unsubscribed from notifications for <@${user.id}> in this channel.`);
    }
  },
};
