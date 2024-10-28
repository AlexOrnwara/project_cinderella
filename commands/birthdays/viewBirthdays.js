const { SlashCommandBuilder } = require('discord.js');
const { loadBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewbirthdays')
        .setDescription('View all birthdays'),
    async execute(interaction) {
        const birthdaysData = loadBirthdays();

        if (birthdaysData.birthdays.length === 0) {
            return interaction.reply('No birthdays in the list.');
        }

        const birthdayList = birthdaysData.birthdays
            .map(birthday => `**${birthday.name}** - ${birthday.dob} (Age: ${birthday.age})`)
            .join('\n');

        await interaction.reply(`🎉 Here are all the birthdays:\n${birthdayList}`);
    }
};
