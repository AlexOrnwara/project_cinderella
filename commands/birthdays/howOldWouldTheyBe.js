const { SlashCommandBuilder } = require('@discordjs/builders');
const { calculateFutureAge } = require('./birthdayUtils'); // Assuming this function is in birthdayUtils.js
const fs = require('fs');
const path = require('path');

const birthdaysFilePath = path.join(__dirname, 'birthdays.json'); // Adjust path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howoldwouldtheybe')
        .setDescription('Calculate how old someone will be on a future date.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the person')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        // Read and parse the birthdays file
        let birthdays = [];
        try {
            const data = fs.readFileSync(birthdaysFilePath, 'utf8');
            birthdays = JSON.parse(data);
        } catch (error) {
            return interaction.reply('Failed to read the birthdays file.');
        }

        // Find the birthday entry
        const birthdayEntry = birthdays.find(b => b.name.toLowerCase() === name.toLowerCase());
        if (!birthdayEntry) {
            return interaction.reply(`No birthday found for **${name}**.`);
        }

        // Send a message asking for a future date
        await interaction.reply(`You selected **${name}**. Please enter a future date in DD-MM-YYYY format.`);

        // Collect the future date response
        const filter = response => {
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/; // DD-MM-YYYY regex
            return response.author.id === interaction.user.id && dateRegex.test(response.content);
        };

        const futureDateCollector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        futureDateCollector.on('collect', async response => {
            const futureDate = response.content;

            // Calculate age
            const age = calculateFutureAge(birthdayEntry.dob, futureDate);
            await interaction.followUp(`${name} would be **${age}** years old on **${futureDate}**.`);
            futureDateCollector.stop();
        });

        futureDateCollector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('You did not provide a valid date in time. Please try again.');
            }
        });
    },
};
