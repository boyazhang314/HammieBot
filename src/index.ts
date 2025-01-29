import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

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
        Deno.env.get("WELCOME_CHANNEL_ID")!
    );

    if (!channel?.isTextBased()) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Welcome ${member.user.username}!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
            `
      Thanks for joining **${member.guild.name}**!
      - Read the rules in <#${Deno.env.get("RULES_CHANNEL_ID")}>
      - Get roles in <#${Deno.env.get("ROLES_CHANNEL_ID")}>
      - Member count: ${member.guild.memberCount}
    `
        )
        .setFooter({ text: "Enjoy your stay!" });

    await channel.send({ embeds: [welcomeEmbed] });
});

client.login(Deno.env.get("TOKEN"));
