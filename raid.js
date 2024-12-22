import { Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder } from 'discord.js';
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
const timeoutDuration = 20 * 1000; 
const messageLimit = 5; 
const timeWindow = 10 * 1000; 

const mp4Url = "https://cdn.discordapp.com/attachments/1196885529845829674/1316820602002079805/inter_tecavuz.mp4?ex=675c7040&is=675b1ec0&hm=fc85c6ab7a3506d27c8254dca88057154facbcaea286a4a1abb14cf8345c051b&";
const urlToCheck = "https://cdn.discordapp.com/attachments/1196885529845829674/1311408173176979539/image.png";
const mehmet12ws = "carman";
const mehmet = "sa";
const mehmet1 = "selam";

const kurtlarVadisiMessages = [
    "Benim rahat etmediğim dünyada kimse istirahat edemez.",
    "ölüm ölüm dediğin nedir ki gülüm ben senin için yaşamayı göze almışım.",
    "aşk mı o beni 0ldürür usta.",
    "kadın milletinden hiç yüzümüz gülmedi be orhan.",
    "senin abinde nah böyle var",
];

client.on("ready", () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity('Tyix Çok Konuşmuş Carman Pnd Köpeğini Alırım Şimdi');

setInterval(() => {
    const randomMessage = kurtlarVadisiMessages[Math.floor(Math.random() * kurtlarVadisiMessages.length)];
    
    const channel = client.channels.cache.get('1196885529845829674'); 
    
    if (channel && channel.isText()) {
        channel.send(randomMessage);
    }
}, 3600000); // 1 saat (3600000 ms)


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const words = message.content.split(/\s+/);

    if (words.includes("sa")) {
        await message.reply("aleyküm selam kardeşim");
    }

    if (words.includes("selam")) {
        await message.reply("aleyküm selam kardeşim");
    }

    if (message.content.includes(urlToCheck)) {
        await message.reply("Komik mi yarram");
    }

    if (message.content.includes(mehmet12ws)) {
        await message.reply("C si büyük olsun");
    }

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

                await message.channel.send(mp4Url); 

                await message.channel.send("Flood yapmayalım lütfen.");

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
    console.log(`Sunucu ${port} numaralı bağlantı noktasında çalışıyor.`);
});

client.login(process.env.TOKEN);
