const { SlashCommandBuilder } = require('discord.js');
const { sendWeeklyReminder } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weeklyreminder')
        .setDescription('Send a reminder for all birthdays in the next week'),
    async execute(interaction) {
        await sendWeeklyReminder();
        await interaction.reply("✅ Weekly birthday reminder sent!");
    }
};
