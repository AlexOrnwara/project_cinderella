const { SlashCommandBuilder } = require('discord.js');
const { loadBirthdays, saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('batchinsertbirthdays')
        .setDescription('Batch insert new birthdays')
        .addStringOption(option =>
            option.setName('birthdays')
                .setDescription('Format: name1,DD-MM-YYYY; name2,DD-MM-YYYY; ... (leave blank to cancel)')
                .setRequired(true)),
    async execute(interaction) {
        // Acknowledge the interaction immediately
        await interaction.deferReply();

        const birthdaysInput = interaction.options.getString('birthdays');
        const birthdayEntries = birthdaysInput.split(';').map(entry => entry.trim());
        const birthdaysData = loadBirthdays();
        
        let responseMessages = []; // To store messages for response

        for (const entry of birthdayEntries) {
            const [name, dob] = entry.split(',').map(item => item.trim());

            if (!name || !dob) {
                responseMessages.push(`Invalid format for entry: **${entry}**. Please use: name,DD-MM-YYYY.`);
                continue;
            }

            const [day, month, year] = dob.split('-').map(Number);
            const birthDate = new Date(year, month - 1, day);
            if (isNaN(birthDate) || birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
                responseMessages.push(`Invalid date format for **${name}**. Use DD-MM-YYYY.`);
                continue;
            }

            const existingBirthdayIndex = birthdaysData.birthdays.findIndex(b => b.name === name && b.dob === dob);
            if (existingBirthdayIndex !== -1) {
                responseMessages.push(`Birthday for **${name}** already exists.`);
                continue;
            }

            const age = calculateAge(dob);
            birthdaysData.birthdays.push({ name, dob, age });
        }

        saveBirthdays(birthdaysData);

        // Send a consolidated response
        if (responseMessages.length > 0) {
            await interaction.editReply('🎉 Batch insert completed with some messages:\n' + responseMessages.join('\n'));
        } else {
            await interaction.editReply('🎉 Batch insert completed successfully!');
        }
    }
};

function calculateAge(dob) {
    const [day, month, year] = dob.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
