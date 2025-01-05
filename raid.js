import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
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

client.on("ready", () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

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
                // Kullanıcıyı timeout'a alıyoruz
                const guildMember = await message.guild.members.fetch(userId);
                await guildMember.timeout(timeoutDuration, "Anti-raid aktif!");

                // Mesajları anında siliyoruz
                await message.delete();
                if (messagesToDelete[userId]) {
                    for (const msg of messagesToDelete[userId]) {
                        try {
                            await msg.delete();  // Önceden gönderilen mesajları da siliyoruz
                        } catch (error) {
                            console.error(`Mesaj silinirken hata oluştu: ${msg.id}`);
                        }
                    }
                }

                messagesToDelete[userId] = [];  // Mesajları silindikten sonra sıfırlıyoruz
            } catch (error) {
                console.error(`Yetki hatası: ${message.author.tag}`);
            }
        }

        if (!messagesToDelete[userId]) {
            messagesToDelete[userId] = [];
        }

        if (messagesToDelete[userId].length >= messageLimit) {
            messagesToDelete[userId].shift();
        }

        messagesToDelete[userId].push(message);  // Mesajları kayıt altına alıyoruz
        userMessageTimes[userId] = timestamps;  // Kullanıcının mesaj zamanlarını güncelliyoruz
    } else {
        userMessageTimes[userId] = [currentTime];
        messagesToDelete[userId] = [message];  // İlk mesajı kayıt altına alıyoruz
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
