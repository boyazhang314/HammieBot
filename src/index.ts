import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(
        process.env.WELCOME_CHANNEL_ID!
    );

    if (!channel?.isTextBased()) return;

    await channel.send(`Welcome ${member} to the server!`);

    const welcomeEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Welcome ${member.user.username}!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
            `
      Thanks for joining **${member.guild.name}**!
      - Read the rules in <#rules-channel-id>
      - Get roles in <#roles-channel-id>
      - Member count: ${member.guild.memberCount}
    `
        )
        .setFooter({ text: "Enjoy your stay!" });

    await channel.send({ embeds: [welcomeEmbed] });
});

client.login(process.env.TOKEN);
