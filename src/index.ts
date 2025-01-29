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
        .setColor(0xffd4ec)
        .setTitle("Hamster Care Guide (꜆ ՞︲⩊︲՞꜀)")
        .setDescription(
            `
    1. Follow Discord TOS
    2. Be kind and respectful of others
    3. Do not rant, vent, or discuss potentially controversial topics
    4. No NSFW
    5. Have fun!
    `
        )
        .setFooter({
            text: "Please read carefully and react to gain access to the server!",
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
        .setColor(0xffd4ec)
        .setTitle(`Welcome ${member.user.username}!`)
        .setDescription(
            `
Thanks for joining Hamster Wheel ⪩ •⩊• ⪨
- Read the rules in <#${Deno.env.get("RULES_CHANNEL_ID")}>
- Collect your roles in <#${Deno.env.get("ROLES_CHANNEL_ID")}>
`
        )
        .setImage("attachment://banner.png")
        .setFooter({ text: "₍ᐢ. .ᐢ₎ ₍ᐢ. .ᐢ₎ ₍ᐢ. .ᐢ₎ ₍ᐢ. .ᐢ₎ ₍ᐢ. .ᐢ₎ ₍ᐢ. .ᐢ₎" });

    await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });
});

client.on("messageReactionAdd", async (reaction, user) => {
    console.log("reaction");
    if (user.bot) return;

    if (reaction.message.channel.id === Deno.env.get("RULES_CHANNEL_ID")) {
        console.log("reaction in rules");
        const guild = reaction.message.guild;
        if (!guild) return;

        const member = await guild.members.fetch(user.id);
        console.log(member);
        const role = guild.roles.cache.get(
            String(Deno.env.get("NIBBLERS_ROLE_ID"))
        );
        console.log(role);

        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            console.log(`Added role to ${user.username}`);
        }
    }
});

client.login(Deno.env.get("TOKEN"));
