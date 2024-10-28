const { SlashCommandBuilder } = require('discord.js');
const { loadBirthdays, saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('batcheditbirthdays')
        .setDescription('Batch edit birthdays')
        .addStringOption(option =>
            option.setName('edits')
                .setDescription('Format: name1:new_name1,new_dob1; name2:new_name2,new_dob2; ... (leave blank to cancel)')
                .setRequired(true)),
    async execute(interaction) {
        const editsInput = interaction.options.getString('edits');
        const edits = editsInput.split(';').map(entry => entry.trim()); // Split by semicolon to get each entry
        const birthdaysData = loadBirthdays();

        for (const edit of edits) {
            const [currentName, newValues] = edit.split(':');
            const [newName, newDob] = newValues ? newValues.split(',') : [null, null];

            const birthdayIndex = birthdaysData.birthdays.findIndex(b => b.name === currentName.trim());
            if (birthdayIndex === -1) {
                await interaction.followUp(`No birthday found for **${currentName}**.`);
                continue;
            }

            const currentBirthday = birthdaysData.birthdays[birthdayIndex];

            // Update fields if new values are provided
            if (newName) {
                currentBirthday.name = newName.trim();
            }
            
            if (newDob) {
                // Validate the new date of birth
                const [day, month, year] = newDob.split('-').map(Number);
                const birthDate = new Date(year, month - 1, day);
                if (isNaN(birthDate) || birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
                    await interaction.followUp(`Invalid date format for **${currentName}**. Use DD-MM-YYYY.`);
                    continue;
                }
                currentBirthday.dob = newDob.trim();
                currentBirthday.age = calculateAge(newDob); // Update age
            }
        }

        // Save the updated birthdays data
        saveBirthdays(birthdaysData);

        await interaction.reply('🎉 Batch update completed successfully!');
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
