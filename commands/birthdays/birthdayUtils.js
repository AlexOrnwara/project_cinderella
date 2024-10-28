const fs = require('fs');
const path = './birthdayData.json';
const { Client, TextChannel } = require('discord.js');

const { token, birthdayChannelId } = require('../../config.json');

const loadBirthdays = () => {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
};

const saveBirthdays = (data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};

// Helper function to get upcoming birthdays for a given range
const getUpcomingBirthdays = (startDate, endDate) => {
    const birthdays = loadBirthdays().birthdays;
    return birthdays.filter(person => {
        const dob = new Date(person.dob);
        dob.setFullYear(startDate.getFullYear()); // Adjust year to compare day/month only

        return dob >= startDate && dob <= endDate;
    });
};

// Sends monthly birthday reminders
const sendMonthlyReminder = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const upcomingBirthdays = getUpcomingBirthdays(startOfMonth, endOfMonth);
    const message = upcomingBirthdays.length > 0
        ? upcomingBirthdays.map(person => `🎉 ${person.name}'s birthday is on ${person.dob} (Turning ${person.age + (now.getFullYear() - new Date(person.dob).getFullYear())})`).join('\n')
        : "No birthdays this month!";
    await sendReminderMessage(`There are ${upcomingBirthdays.length} this month!`)
    await sendReminderMessage(message);
};

// Sends weekly birthday reminders
const sendWeeklyReminder = async () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const upcomingBirthdays = getUpcomingBirthdays(now, nextWeek);
    const message = upcomingBirthdays.length > 0
        ? upcomingBirthdays.map(person => `🎉 ${person.name}'s birthday is on ${person.dob} (Turning ${person.age + (now.getFullYear() - new Date(person.dob).getFullYear())})`).join('\n')
        : "No birthdays this week!";

    await sendReminderMessage(`There are ${upcomingBirthdays.length} next week!`)
    await sendReminderMessage(message);
};

// Helper function to send a reminder message to a specific channel
const sendReminderMessage = async (message) => {
    const client = new Client({ intents: [] }); // Adjust intents if needed
    await client.login(token); // Use your actual bot token here

    client.once('ready', async () => {
        const channel = client.channels.cache.get(birthdayChannelId); // Replace with actual channel ID
        if (channel instanceof TextChannel) {
            await channel.send(message);
        }
        await client.destroy(); // Log out the bot after sending
    });
};

module.exports = { loadBirthdays, saveBirthdays, sendMonthlyReminder, sendWeeklyReminder };
