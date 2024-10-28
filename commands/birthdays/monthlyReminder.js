const { SlashCommandBuilder } = require('discord.js');
const { sendMonthlyReminder } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('monthlyreminder')
        .setDescription('Send a reminder for all birthdays in the current month'),
    async execute(interaction) {
        await sendMonthlyReminder();
        await interaction.reply("✅ Monthly birthday reminder sent!");
    }
};
