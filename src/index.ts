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
const EMERGENCY_EMOJI = "🚨";
const SCHEDULE_EMOJI = "📅";

const OSHI_EMOJIS: { [key: string]: string[] } = {
    kohane: ["1334572383377428544", "1334576324785999972"],
    akito: ["1334573211685486622", "1334576463378120785"],
    an: ["1334575281415000094", "1334576720899997727"],
    toya: ["1334575663411236934", "1334576815653781556"],
};

const OSHI_EMOJI_TO_ROLE: { [key: string]: string } = {
    "1334572383377428544": "1334576324785999972", // Kohane
    "1334573211685486622": "1334576463378120785", // Akito
    "1334575281415000094": "1334576720899997727", // An
    "1334575663411236934": "1334576815653781556", // Toya
};

const FEEDER_EMOJI_TO_ROLE: { [key: string]: string } = {
    [EMERGENCY_EMOJI]: "1334594991049146441",
    [SCHEDULE_EMOJI]: "1334594936317935707",
};

const FEEDER_ROLE_ID = "1332858196523745384";

const setupRulesChannel = async () => {
    const rulesChannel = client.channels.cache.get(
        Deno.env.get("RULES_CHANNEL_ID")!
    ) as TextChannel;

    const messages = await rulesChannel.messages.fetch({ limit: 1 });

    const rules = new AttachmentBuilder("images/sleep.png", {
        name: "sleep.png",
    });

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
            })
            .setImage("attachment://sleep.png");

        const rulesMessage = await rulesChannel.send({
            embeds: [rulesEmbed],
            files: [rules],
        });
        await rulesMessage.react(REACTION_EMOJI);
    }
};

const setupRolesChannel = async () => {
    const rolesChannel = client.channels.cache.get(
        Deno.env.get("ROLES_CHANNEL_ID")!
    ) as TextChannel;

    const messages = await rolesChannel.messages.fetch({ limit: 2 });

    const roles1 = new AttachmentBuilder("images/roles1.png", {
        name: "roles1.png",
    });
    const roles2 = new AttachmentBuilder("images/roles2.png", {
        name: "roles2.png",
    });

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
            )
            .setImage("attachment://roles1.png");

        const feederRolesEmbed = new EmbedBuilder()
            .setColor(0xffd4ec)
            .setTitle("Feeder Roles")
            .setDescription(
                `
${SCHEDULE_EMOJI} <@&${FEEDER_EMOJI_TO_ROLE[SCHEDULE_EMOJI]}>
${EMERGENCY_EMOJI} <@&${FEEDER_EMOJI_TO_ROLE[EMERGENCY_EMOJI]}>
`
            )
            .setImage("attachment://roles2.png")
            .setFooter({ text: "Come run in the hamster wheel!" });

        const oshiRolesMessage = await rolesChannel.send({
            embeds: [oshiRolesEmbed],
            files: [roles1],
        });

        const feederRolesMessage = await rolesChannel.send({
            embeds: [feederRolesEmbed],
            files: [roles2],
        });

        await oshiRolesMessage.react(`<:kohane:${OSHI_EMOJIS.kohane[0]}>`);
        await oshiRolesMessage.react(`<:an:${OSHI_EMOJIS.an[0]}>`);
        await oshiRolesMessage.react(`<:akito:${OSHI_EMOJIS.akito[0]}>`);
        await oshiRolesMessage.react(`<:toya:${OSHI_EMOJIS.toya[0]}>`);

        await feederRolesMessage.react(SCHEDULE_EMOJI);
        await feederRolesMessage.react(EMERGENCY_EMOJI);
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
        .setImage("attachment://banner.png");

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
        if (reaction.message.embeds[0].title === "VBS Roles") {
            if (
                !reaction.emoji.id ||
                !(reaction.emoji.id in OSHI_EMOJI_TO_ROLE)
            ) {
                reaction.remove();
                return;
            }

            const role = guild.roles.cache.get(
                OSHI_EMOJI_TO_ROLE[reaction.emoji.id]
            );

            if (role && !member.roles.cache.has(role.id)) {
                await member.roles.add(role);
            }
        } else {
            if (
                !reaction.emoji.name ||
                !(reaction.emoji.name in FEEDER_EMOJI_TO_ROLE)
            ) {
                reaction.remove();
                return;
            }

            const role = guild.roles.cache.get(
                FEEDER_EMOJI_TO_ROLE[reaction.emoji.name]
            );

            const feeder_role = guild.roles.cache.get(FEEDER_ROLE_ID);

            if (role && !member.roles.cache.has(role.id)) {
                await member.roles.add(role);
            }

            if (feeder_role && !member.roles.cache.has(FEEDER_ROLE_ID)) {
                await member.roles.add(feeder_role);
            }
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
        if (reaction.message.embeds[0].title === "VBS Roles") {
            if (
                !reaction.emoji.id ||
                !(reaction.emoji.id in OSHI_EMOJI_TO_ROLE)
            ) {
                return;
            }

            const role = guild.roles.cache.get(
                OSHI_EMOJI_TO_ROLE[reaction.emoji.id]
            );

            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
            }
        } else {
            if (
                !reaction.emoji.name ||
                !(reaction.emoji.name in FEEDER_EMOJI_TO_ROLE)
            ) {
                return;
            }

            const role = guild.roles.cache.get(
                FEEDER_EMOJI_TO_ROLE[reaction.emoji.name]
            );

            const feeder_role = guild.roles.cache.get(FEEDER_ROLE_ID);

            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
            }

            if (feeder_role && member.roles.cache.has(FEEDER_ROLE_ID)) {
                for (const [key, value] of Object.entries(
                    FEEDER_EMOJI_TO_ROLE
                )) {
                    if (key !== reaction.emoji.name) {
                        const other_role = guild.roles.cache.get(value);
                        if (
                            other_role &&
                            !member.roles.cache.has(other_role.id)
                        ) {
                            await member.roles.remove(feeder_role);
                        }
                    }
                }
            }
        }
    }
});

client.login(Deno.env.get("TOKEN"));
