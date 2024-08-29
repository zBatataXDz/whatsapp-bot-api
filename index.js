require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');

// Twitch API setup
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const twitchClient = new ApiClient({ authProvider });

// WhatsApp setup
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    setInterval(updateGroupName, 60000); // Check every minute
});

async function updateGroupName() {
    const channelName = 'viibe_y';
    const groupId = process.env.WHATSAPP_GROUP_ID;

    try {
        const user = await twitchClient.helix.users.getUserByName(channelName);
        if (!user) {
            console.log('User not found');
            return;
        }

        const stream = await twitchClient.helix.streams.getStreamByUserId(user.id);
        const status = stream ? 'LIVE ON ✅' : 'LIVE OFF ❌';
        const newGroupName = `VABE SLOTS | ${status}`;

        const chat = await client.getChatById(groupId);
        await chat.setSubject(newGroupName);
        console.log(`Updated group name to: ${newGroupName}`);
    } catch (error) {
        console.error('Error updating group name:', error);
    }
}

client.initialize();