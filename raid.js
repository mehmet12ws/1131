import { Client, GatewayIntentBits, Partials, AttachmentBuilder } from 'discord.js';
import express from 'express';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
});

const TARGET_USER_ID = "899770593589751808"; 
const TARGET_CHANNEL_ID = "1196885529845829674"; 
const FLOOD_TIMEOUT = 10 * 1000; 
const FLOOD_LIMIT = 5; 
const FLOOD_TIME_WINDOW = 10 * 1000; 
const mp4Url = "https://cdn.discordapp.com/attachments/1279508387977236581/1315705553736962119/that_one_mehmet_edit.mp4";

const userMessageTimes = {};
const messagesToDelete = {};

client.on("ready", () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity('marsı yedim egepoyo carmanda aldım altıma ohh');
});

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'DM' && message.author.id === TARGET_USER_ID) {
        const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
        if (!targetChannel) {
            console.error(`Hedef kanal bulunamadı: ${TARGET_CHANNEL_ID}`);
            return;
        }

        try {
            await targetChannel.send(`${message.content}`);
        } catch (error) {
            console.error(`Mesaj gönderilemedi: ${error}`);
        }
        return;
    }

    if (!message.guild || message.author.bot) return;

    const words = message.content.split(/\s+/);

    if (words.includes("sa")) {
        await message.reply("aleyküm selam kardeşim");
    }

    if (words.includes("selam")) {
        await message.reply("aleyküm selam kardeşim");
    }

    if (message.content.includes("https://cdn.discordapp.com/attachments/")) {
        await message.reply("Komik mi yarram");
    }

    if (message.content.includes("carman")) {
        await message.reply("carman delinin biri");
    }

    const userId = message.author.id;
    const currentTime = Date.now();

    if (userMessageTimes[userId]) {
        let timestamps = userMessageTimes[userId];
        timestamps = timestamps.filter((timestamp) => currentTime - timestamp < FLOOD_TIME_WINDOW);
        timestamps.push(currentTime);

        if (timestamps.length >= FLOOD_LIMIT) {
            try {
                const guildMember = await message.guild.members.fetch(userId);
                await guildMember.timeout(FLOOD_TIMEOUT, "Flood yapma uyarısı.");

                const attachment = new AttachmentBuilder(mp4Url, { name: 'video.mp4' });
                await message.channel.send({
                    content: `${message.author}`,
                    files: [attachment],
                });

                await message.channel.send("Flood yapmayalım lütfen.");
            } catch (error) {
                console.error(`Bot yetki hatası: ${message.author.tag}`);
            }
        }

        userMessageTimes[userId] = timestamps;
    } else {
        userMessageTimes[userId] = [currentTime];
    }
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Sunucu ${port} numaralı bağlantı noktasında çalışıyor.`);
});

client.login(process.env.TOKEN);
