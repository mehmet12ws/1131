import { Client, GatewayIntentBits, Partials, EmbedBuilder } from 'discord.js';
import fs from 'fs';
import express from 'express'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const userMessageTimes = {};
const messagesToDelete = {};

const timeoutDuration = 10 * 1000; 
const messageLimit = 5;
const timeWindow = 10 * 1000;

const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg_jQ5pPIz5pSy-WT9Tcu9KIKUK9jRJDNudA&s";

client.on("ready" , () => {
client.user.setActivity('Test')
}}
    




client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const currentTime = Date.now();

    if (userMessageTimes[userId]) {
        let timestamps = userMessageTimes[userId];
        timestamps = timestamps.filter((timestamp) => currentTime - timestamp < timeWindow);
        timestamps.push(currentTime);

        if (timestamps.length >= messageLimit) {
            try {
                const guildMember = await message.guild.members.fetch(userId);
                await guildMember.timeout(timeoutDuration, "mehmet12ws anti-raid aktif.");

                if (messagesToDelete[userId]) {
                    for (const msg of messagesToDelete[userId]) {
                        try {
                            await msg.delete();
                        } catch (error) {
                            console.error(`Hata: ${msg.id}`);
                        }
                    }
                }

                const embed = new EmbedBuilder().setImage(imageUrl);
                await message.channel.send({
                    content: `${message.author}`,
                    embeds: [embed],
                });

                await message.channel.send("flood yapmayalım lütfen.");


                messagesToDelete[userId] = [];
            } catch (error) {
                console.error(`Bot yetki hatası: ${message.author.tag}`);
            }
        }

        if (!messagesToDelete[userId]) {
            messagesToDelete[userId] = [];
        }

        if (messagesToDelete[userId].length >= messageLimit) {
            messagesToDelete[userId].shift();
        }

        messagesToDelete[userId].push(message);

        userMessageTimes[userId] = timestamps;
    } else {
        userMessageTimes[userId] = [currentTime];
        messagesToDelete[userId] = [message];
    }
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Sunucu ${port} numaralı bağlantı noktasında yürütülüyor.`);
});

client.login(process.env.TOKEN);
