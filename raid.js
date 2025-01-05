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
const timeoutDuration = 20 * 1000; // 20 saniye timeout süresi
const messageLimit = 5; 
const timeWindow = 10 * 1000; // 10 saniye içerisinde 5 mesaj gönderilirse flood olarak sayılır

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
                // Kullanıcıyı timeout'a alıyoruz (mute uyguluyoruz)
                const guildMember = await message.guild.members.fetch(userId);
                await guildMember.timeout(timeoutDuration, "Anti-raid aktif!");

                // Anında mesajı siliyoruz
                await message.delete();
                console.log(`Mesaj silindi: ${message.id}`);

                // Kullanıcının daha önceki mesajlarını paralel olarak siliyoruz
                if (messagesToDelete[userId]) {
                    const deletePromises = messagesToDelete[userId].map(async (msg) => {
                        try {
                            await msg.delete();
                            console.log(`Mesaj silindi: ${msg.id}`);
                        } catch (error) {
                            console.error(`Mesaj silinirken hata oluştu: ${msg.id} - ${error.message}`);
                        }
                    });

                    // Tüm mesaj silme işlemleri paralel olarak başlatılıyor
                    await Promise.all(deletePromises);
                }

                // Mesajları sıfırlıyoruz
                messagesToDelete[userId] = [];
            } catch (error) {
                console.error(`Yetki hatası: ${message.author.tag} - ${error.message}`);
            }
        }

        // Mesajların sayısını ve zamanını kontrol ediyoruz
        if (!messagesToDelete[userId]) {
            messagesToDelete[userId] = [];
        }

        if (messagesToDelete[userId].length >= messageLimit) {
            messagesToDelete[userId].shift(); // Mesaj sayısını sınırlıyoruz
        }

        // Mesajı kayıt altına alıyoruz
        messagesToDelete[userId].push(message);
        userMessageTimes[userId] = timestamps;
    } else {
        // İlk mesajı kayıt altına alıyoruz
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
