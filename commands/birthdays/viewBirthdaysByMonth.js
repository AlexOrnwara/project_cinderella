const { SlashCommandBuilder } = require('discord.js');
const { loadBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewbirthdaysbymonth')
        .setDescription('View all birthdays in a specific month')
        .addIntegerOption(option =>
            option.setName('month')
                .setDescription('The month number (1-12)')
                .setRequired(true)),
    async execute(interaction) {
        const month = interaction.options.getInteger('month');
        const birthdaysData = loadBirthdays();

        const birthdaysInMonth = birthdaysData.birthdays.filter(birthday => {
            const birthMonth = new Date(birthday.dob).getMonth() + 1;
            return birthMonth === month;
        });

        if (birthdaysInMonth.length === 0) {
            return interaction.reply(`No birthdays found for month ${month}.`);
        }

        const birthdayList = birthdaysInMonth
            .map(birthday => `**${birthday.name}** - ${birthday.dob} (Age: ${birthday.age})`)
            .join('\n');

        await interaction.reply(`🎉 Birthdays in month ${month}:\n${birthdayList}`);
    }
};
