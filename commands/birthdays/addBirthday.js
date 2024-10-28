const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadBirthdays, saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbirthday')
        .setDescription('Add a new birthday')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the person')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('dob')
                .setDescription('Date of birth (DD-MM-YYYY)')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const dob = interaction.options.getString('dob');
        const age = calculateAge(dob);

        // Load existing birthdays
        const birthdaysData = loadBirthdays();

        // Check for duplicates by matching name and DOB
        const duplicate = birthdaysData.birthdays.find(person => person.name === name && person.dob === dob);

        if (duplicate) {
            // If a duplicate exists, create buttons for overwrite or rename
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('overwrite')
                        .setLabel('Overwrite')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('rename')
                        .setLabel('Rename')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({
                content: `A birthday entry for **${name}** on **${dob}** already exists.\nWould you like to overwrite the existing entry or rename this one?`,
                components: [row],
                ephemeral: true
            });

            // Handle the button interactions
            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'overwrite') {
                    // Overwrite the duplicate entry
                    duplicate.age = age;
                    saveBirthdays(birthdaysData);
                    await i.update({ content: `🎉 Overwrote the birthday for ${name} on ${dob}.`, components: [] });
                } else if (i.customId === 'rename') {
                    // Rename the new entry
                    const newName = `${name} (New)`;
                    birthdaysData.birthdays.push({ name: newName, dob, age });
                    saveBirthdays(birthdaysData);
                    await i.update({ content: `🎉 Added a new entry as "${newName}" for the same date.`, components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: "No option selected. Birthday addition canceled.", components: [] });
                }
            });
        } else {
            // If no duplicate exists, add the new birthday
            birthdaysData.birthdays.push({ name, dob, age });
            saveBirthdays(birthdaysData);
            await interaction.reply(`🎉 Birthday for ${name} added successfully!`);
        }
    }
};



function calculateAge(dob) {
    const [day, month, year] = dob.split('-').map(Number); // Split the input string and convert to numbers
    const birthDate = new Date(year, month - 1, day); // Create a Date object (months are 0-indexed in JS)
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}