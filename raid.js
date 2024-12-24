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

const mp4Url = "https://cdn.discordapp.com/attachments/1196885529845829674/1316820602002079805/inter_tecavuz.mp4";
const urlToCheck = "https://cdn.discordapp.com/attachments/1196885529845829674/1311408173176979539/image.png";
const mehmet12ws = "carman";
const kurtlarVadisiMessages = [
    "Benim rahat etmediğim dünyada kimse istirahat edemez.",
    "Ölüm ölüm dediğin nedir ki gülüm ben senin için yaşamayı göze almışım.",
    "Aşk mı? O beni öldürür usta.",
    "Kadın milletinden hiç yüzümüz gülmedi be Orhan.",
    "nasılsa cennete gidemeyeceğiz memati ,cehennemi hak edelim",
    "kötü köpek sürüye kurt getirdi aslan amca.",
    "itaatsizliğin raconunu biz koymadık ama biz uygularız",
    "memati ortalığı ayağa kaldır güneş yokken gözlük takan adam benimdir",
    "elif daima var. sadece var olanı sevmez insan. anılarını sever, geçmişini sever, ilklerini sever, sonlarını sever. yanında olsa da sever, olmasa da sever. ben uzun yıllar elifin yanında yoktum, beni sevdi. şimdi o benim yanımda yok, ne değişti ki ben onu sevmekten vazgeçeyim.",
    "kapı kapı dolaşma vakti bitmiştir yazıhanecilik bitmiştir bu saatten sonra kendi kapımıza hakim olacağız it de uğrar çakal da uğrar aslan da uğrar ite it gibi çakala çakal gibi aslana aslan gibi davranıcağız.",
    "hapşu hapşu hapşu",
    "Çok Şey Konuşulabilir Ama Ayrılık Tarif Edilemez",
    "Sen En Büyük Günahların Bedelisin",
    "Arda Turan Üzgün",
    "Yaptıklarım İçin Çok Pişmanım",
    "Sabah Ezanını Duymayan Adam İnsanlıktan Nasibini Alamaz",
    "Baktı Herkes Uyumuş Onunda Uyuması Gerek Uykusuzluk İşte",    
];

client.on("ready", () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity('Tyix Çok Konuşmuş Carman Pnd Köpeğini Alırım Şimdi');

    const channel = client.channels.cache.get('1196885529845829674'); 

    if (channel && channel.type === ChannelType.GuildText) {
        const randomMessage = kurtlarVadisiMessages[Math.floor(Math.random() * kurtlarVadisiMessages.length)];
        channel.send(randomMessage).catch(console.error);

        setInterval(() => {
            const randomMessage = kurtlarVadisiMessages[Math.floor(Math.random() * kurtlarVadisiMessages.length)];
            channel.send(randomMessage).catch(console.error);
        }, 3600000); 
    } else {
        console.error("Belirtilen kanal bulunamadı veya metin kanalı değil.");
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; 

    const words = message.content.split(/\s+/);

    if (words.includes("sa")) {
        await message.reply("Aleyküm selam kardeşim!");
    }

    if (message.content.includes(urlToCheck)) {
        await message.reply("Komik mi yarram?");
    }

    if (message.content.includes(mehmet12ws)) {
        await message.reply("C'si büyük olsun.");
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
                await guildMember.timeout(timeoutDuration, "Anti-raid aktif!");

                if (messagesToDelete[userId]) {
                    for (const msg of messagesToDelete[userId]) {
                        try {
                            await msg.delete();
                        } catch (error) {
                            console.error(`Mesaj silinirken hata oluştu: ${msg.id}`);
                        }
                    }
                }

                await message.channel.send(mp4Url); 
                await message.channel.send("Flood yapmayalım lütfen.");
                messagesToDelete[userId] = [];
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
