const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { loadBirthdays, saveBirthdays } = require('./birthdayUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletebirthday')
        .setDescription('Delete a birthday from the list.'),
    async execute(interaction) {
        const birthdaysData = loadBirthdays();

        if (birthdaysData.birthdays.length === 0) {
            return interaction.reply('No birthdays to delete.');
        }

        // Create a select menu to list all birthdays
        const options = birthdaysData.birthdays.map((birthday, index) => ({
            label: `${birthday.name} - ${birthday.dob}`,
            description: `Age: ${birthday.age}`,
            value: index.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('delete_birthday')
            .setPlaceholder('Select a birthday to delete')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Select a birthday to delete:',
            components: [row],
            ephemeral: true
        });

        const filter = i => i.customId === 'delete_birthday' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            const index = parseInt(i.values[0], 10);
            const deleted = birthdaysData.birthdays.splice(index, 1)[0];
            saveBirthdays(birthdaysData);
            await i.update({ content: `🎉 Deleted birthday for ${deleted.name} on ${deleted.dob}.`, components: [] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: "No birthday selected. Deletion canceled.", components: [] });
            }
        });
    }
};
