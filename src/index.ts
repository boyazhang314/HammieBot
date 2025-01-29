import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    TextChannel,
    AttachmentBuilder,
} from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
});

client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    const rulesChannel = client.channels.cache.get(
        Deno.env.get("RULES_CHANNEL_ID")!
    ) as TextChannel;

    const rulesEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Hamster Care Guide (꜆ ՞︲⩊︲՞꜀)")
        .setDescription(
            `
1. Follow Discord TOS
2. Be kind and respectful
3. Do not rant or vent
4. No NSFW
`
        )
        .setFooter({
            text: "Make sure to read carefully and follow these steps!",
        });

    await rulesChannel.send({ embeds: [rulesEmbed] });
});

client.on("guildMemberAdd", async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(
        Deno.env.get("WELCOME_CHANNEL_ID")!
    ) as TextChannel;

    const attachment = new AttachmentBuilder("images/banner.png", {
        name: "banner.png",
    });

    const welcomeEmbed = new EmbedBuilder()
        .setColor(0xee1166)
        .setTitle(`Welcome ${member.user.username}!`)
        .setDescription(
            `
Thanks for joining Hamster Wheel ⪩ •⩊• ⪨
- Please read the rules in <#${Deno.env.get("RULES_CHANNEL_ID")}>
- Collect roles in <#${Deno.env.get("ROLES_CHANNEL_ID")}>
`
        )
        .setImage("attachment://banner.png")
        .setFooter({ text: "Have fun!" });

    await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });
});

client.login(Deno.env.get("TOKEN"));
