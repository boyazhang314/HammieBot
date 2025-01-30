import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    TextChannel,
    AttachmentBuilder,
    Partials,
} from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const REACTION_EMOJI = "✅";

const OSHI_EMOJIS: { [key: string]: string[] } = {
    kohane: ["1334572383377428544", "1334576324785999972"],
    akito: ["1334573211685486622", "1334576463378120785"],
    an: ["1334575281415000094", "1334576720899997727"],
    toya: ["1334575663411236934", "1334576815653781556"],
};

const EMOJI_TO_ROLE: { [key: string]: string } = {
    "1334572383377428544": "1334576324785999972",
    "1334573211685486622": "1334576463378120785",
    "1334575281415000094": "1334576720899997727",
    "1334575663411236934": "1334576815653781556",
};

const setupRulesChannel = async () => {
    const rulesChannel = client.channels.cache.get(
        Deno.env.get("RULES_CHANNEL_ID")!
    ) as TextChannel;

    const messages = await rulesChannel.messages.fetch({ limit: 1 });

    if (messages.size === 0) {
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

        const rulesMessage = await rulesChannel.send({ embeds: [rulesEmbed] });
        await rulesMessage.react(REACTION_EMOJI);
    }
};

const setupRolesChannel = async () => {
    const rolesChannel = client.channels.cache.get(
        Deno.env.get("ROLES_CHANNEL_ID")!
    ) as TextChannel;

    const messages = await rolesChannel.messages.fetch({ limit: 2 });

    if (messages.size < 2) {
        const oshiRolesEmbed = new EmbedBuilder()
            .setColor(0xffd4ec)
            .setTitle("VBS Roles")
            .setDescription(
                `
<:kohane:${OSHI_EMOJIS.kohane[0]}> <@&${OSHI_EMOJIS.kohane[1]}>
<:an:${OSHI_EMOJIS.an[0]}> <@&${OSHI_EMOJIS.an[1]}>
<:akito:${OSHI_EMOJIS.akito[0]}> <@&${OSHI_EMOJIS.akito[1]}>
<:toya:${OSHI_EMOJIS.toya[0]}> <@&${OSHI_EMOJIS.toya[1]}>
`
            );

        const oshiRolesMessage = await rolesChannel.send({
            embeds: [oshiRolesEmbed],
        });

        await oshiRolesMessage.react(`<:kohane:${OSHI_EMOJIS.kohane[0]}>`);
        await oshiRolesMessage.react(`<:an:${OSHI_EMOJIS.an[0]}>`);
        await oshiRolesMessage.react(`<:akito:${OSHI_EMOJIS.akito[0]}>`);
        await oshiRolesMessage.react(`<:toya:${OSHI_EMOJIS.toya[0]}>`);
    }
};

client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    await setupRulesChannel();
    await setupRolesChannel();
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
        .setFooter({ text: "₍ᐢ. .ᐢ₎" });

    await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error("Failed to fetch reaction:", error);
            return;
        }
    }

    if (reaction.message.partial) {
        try {
            await reaction.message.fetch();
        } catch (error) {
            console.error("Failed to fetch message:", error);
            return;
        }
    }

    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id);

    if (reaction.message.channel.id === Deno.env.get("RULES_CHANNEL_ID")) {
        if (reaction.emoji.name !== REACTION_EMOJI) {
            reaction.remove();
            return;
        }

        const role = guild.roles.cache.get(
            String(Deno.env.get("NIBBLERS_ROLE_ID"))
        );

        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }
    } else if (
        reaction.message.channel.id === Deno.env.get("ROLES_CHANNEL_ID")
    ) {
        if (!reaction.emoji.id || !(reaction.emoji.id in EMOJI_TO_ROLE)) {
            reaction.remove();
            return;
        }

        const role = guild.roles.cache.get(EMOJI_TO_ROLE[reaction.emoji.id]);

        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error("Failed to fetch reaction:", error);
            return;
        }
    }

    if (reaction.message.partial) {
        try {
            await reaction.message.fetch();
        } catch (error) {
            console.error("Failed to fetch message:", error);
            return;
        }
    }

    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id);

    if (reaction.message.channel.id === Deno.env.get("RULES_CHANNEL_ID")) {
        if (reaction.emoji.name !== REACTION_EMOJI) return;

        const role = guild.roles.cache.get(
            String(Deno.env.get("NIBBLERS_ROLE_ID"))
        );

        if (role && member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
        }
    } else if (
        reaction.message.channel.id === Deno.env.get("ROLES_CHANNEL_ID")
    ) {
        if (!reaction.emoji.id || !(reaction.emoji.id in EMOJI_TO_ROLE)) {
            return;
        }

        const role = guild.roles.cache.get(EMOJI_TO_ROLE[reaction.emoji.id]);

        if (role && member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
        }
    }
});

client.login(Deno.env.get("TOKEN"));
