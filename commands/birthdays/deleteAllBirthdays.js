const { SlashCommandBuilder } = require('discord.js');
const { saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteallbirthdays')
        .setDescription('Delete all birthdays from the list.'),
    async execute(interaction) {
        // Clear the birthdays data
        saveBirthdays({ birthdays: [] }); // Saving an empty array to overwrite the current birthdays

        await interaction.reply('🎉 All birthdays have been deleted successfully!');
    }
};
