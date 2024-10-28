const { SlashCommandBuilder } = require('discord.js');
const { loadBirthdays, saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editbirthday')
        .setDescription('Edit an existing birthday')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the person whose birthday you want to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('new_name')
                .setDescription('The new name of the person (leave blank to keep current name)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('new_dob')
                .setDescription('The new date of birth (DD-MM-YYYY) (leave blank to keep current DOB)')
                .setRequired(false)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const newName = interaction.options.getString('new_name');
        const newDob = interaction.options.getString('new_dob');

        const birthdaysData = loadBirthdays();
        const birthdayIndex = birthdaysData.birthdays.findIndex(b => b.name === name);

        if (birthdayIndex === -1) {
            return interaction.reply(`No birthday found for **${name}**.`);
        }

        const currentBirthday = birthdaysData.birthdays[birthdayIndex];

        // Update fields if new values are provided
        if (newName) {
            currentBirthday.name = newName;
        }
        
        if (newDob) {
            // Validate the new date of birth
            const [day, month, year] = newDob.split('-').map(Number);
            const birthDate = new Date(year, month - 1, day);
            if (isNaN(birthDate) || birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
                return interaction.reply('Please provide a valid date in the format DD-MM-YYYY.');
            }
            currentBirthday.dob = newDob;
            currentBirthday.age = calculateAge(newDob); // Update age
        }

        // Save the updated birthdays data
        saveBirthdays(birthdaysData);

        await interaction.reply(`🎉 Updated birthday for **${name}**: ${newName ? `New Name: **${newName}**` : ''} ${newDob ? `New DOB: **${newDob}** (Age: ${currentBirthday.age})` : ''}`);
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
