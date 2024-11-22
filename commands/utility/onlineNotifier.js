const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');

const subscriptionsPath = path.join(__dirname, 'subscriptions.json');

/**
 * Fetches the list of subscribers from the JSON file.
 * @returns {Object[]} List of subscriptions.
 */
function getSubscriptions() {
  if (!fs.existsSync(subscriptionsPath)) {
    fs.writeFileSync(subscriptionsPath, JSON.stringify({ subscribers: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(subscriptionsPath, 'utf8')).subscribers;
}

/**
 * Updates the subscription list in the JSON file.
 * @param {Object[]} subscriptions - List of updated subscriptions.
 */
function saveSubscriptions(subscriptions) {
  fs.writeFileSync(subscriptionsPath, JSON.stringify({ subscribers: subscriptions }, null, 2));
}

/**
 * Tracks when users come online based on the subscription list and sends notifications.
 * @param {Client} client - The Discord client instance.
 */
function trackUserOnline(client) {
  client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    const subscriptions = getSubscriptions();

    const wasOffline = oldPresence?.status === 'offline';
    const isOnline = newPresence?.status === 'online';

    if (wasOffline && isOnline) {
      subscriptions.forEach(async (sub) => {
        if (sub.userId === newPresence.userId) {
          const channel = await client.channels.fetch(sub.channelId);
          if (channel && channel.isTextBased()) {
            channel.send(`🚀 User <@${sub.userId}> is now online!`);
          }
        }
      });
    }
  });
}

/**
 * Adds or updates a subscription.
 * @param {string} userId - The user to track.
 * @param {string} channelId - The channel for notifications.
 */
function subscribeToUser(userId, channelId) {
  const subscriptions = getSubscriptions();
  const existingSub = subscriptions.find((sub) => sub.userId === userId && sub.channelId === channelId);

  if (!existingSub) {
    subscriptions.push({ userId, channelId });
    saveSubscriptions(subscriptions);
  }
}

/**
 * Removes a subscription.
 * @param {string} userId - The user to stop tracking.
 * @param {string} channelId - The channel to stop notifications in.
 */
function unsubscribeFromUser(userId, channelId) {
  const subscriptions = getSubscriptions();
  const updatedSubscriptions = subscriptions.filter(
    (sub) => !(sub.userId === userId && sub.channelId === channelId)
  );
  saveSubscriptions(updatedSubscriptions);
}

module.exports = { trackUserOnline, subscribeToUser, unsubscribeFromUser };
