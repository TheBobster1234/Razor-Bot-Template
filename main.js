import { promises as fs } from "fs";
import Eris, { Constants, AutocompleteInteraction } from "eris";
import { createClient } from "@supabase/supabase-js";
import Api from "./api/index.js";
import config from "./config.js";
import { clearInterval } from "timers";

const bot = new Eris(config.token, { intents: ["guildMessages", "guilds"] });
const api = new Api();
await api.cosmetics.setupCache();
const supabase = createClient(config.database.url, config.database.key);

bot.commands = new Map();
bot.interactions = new Map();
bot.autocompletes = new Map();

bot.once("ready", async () => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online in ${bot.guilds.size}!`);
    updateStatus();

    const currentCommands = await bot.getCommands();
    const currentCommandNames = currentCommands.map(c => c.name);
    const currentCommandDescriptions = currentCommands.map(c => c.description);

    const files = await fs.readdir("./commands");
    for (const f of files.filter(f => f.endsWith(".js"))) {
        const { default: props } = await import(`./commands/${f}`);
        bot.commands.set(props.info.name, props);
        try {
            if (currentCommandNames.includes(props.info.name)) {
                if (!currentCommandDescriptions.includes(props.info.description)) {
                    await bot.deleteCommand(currentCommands[currentCommandNames.indexOf(props.info.name)].id);
                    await bot.createCommand({ ...props.info, type: Constants.ApplicationCommandTypes.CHAT_INPUT });
                    await console.log(currentCommands[currentCommandNames.indexOf(props.info.name)].id);
                } else {
                    console.log(currentCommands[currentCommandNames.indexOf(props.info.name)].id);
                    continue;
                }
                ;
            } else {
                await bot.createCommand({ ...props.info, type: Constants.ApplicationCommandTypes.CHAT_INPUT });
            }
            ;
        } catch (err) {
            console.log(props.info.name, err);
        }
        ;
    }
    ;
});

bot.on('guildCreate', (guild) => {
    console.log(`Joined a new guild: ${guild.name}`);
    updateStatus();
});

bot.on('guildDelete', (guild) => {
    console.log(`Left a guild: ${guild.name}`);
    updateStatus();
});

bot.on('guildMemberAdd', (guild, member) => {
    console.log(`New member joined: ${member.username}`);
    updateStatus();
});

function updateStatus() {
    const guildCount = bot.guilds.size;
    let totalMembers = 0;

    bot.guilds.forEach(guild => {
        totalMembers += guild.memberCount;
    });
    const statusMessage = `${guildCount} Servers | ${totalMembers} Members!`;

    bot.editStatus('online', {
        name: statusMessage,
        type: 3 // 3 is for "Watching"
    });

    console.log(`Status updated: ${statusMessage}`);
};

// IDs for the role, message, and emoji to watch
const roleID = '1098365864052531239'; // Role ID to assign/remove
const messageID = '1275923684397416488'; // The ID of the message to watch for reactions
const guildID = '1098365864052531230'; // The ID of your guild
const emojiCheck = '✅'; // The emoji to watch for reactions (Unicode or custom emoji)

bot.on('messageReactionAdd', (message, emoji, userID) => {
    if (message.id === messageID && message.channel.guild.id === guildID) {
        try {
            const guild = bot.guilds.get(guildID);
            const member = guild.members.get(userID);

            if (member) {
                member.addRole(roleID);
                console.log(`Added role to ${member.username}`);
            }
        } catch (error) {
            console.error('Error adding role:', error);
        }
    }
});

// Listen for message reactions being removed
bot.on('messageReactionRemove', (message, emoji, userID) => {
    if (message.id === messageID && message.channel.guild.id === guildID) {
        try {
            const guild = bot.guilds.get(guildID);
            const member = guild.members.get(userID);

            if (member) {
                member.removeRole(roleID);
                console.log(`Removed role from ${member.username}`);
            }
        } catch (error) {
            console.error('Error removing role:', error);
        }
    }
});

bot.on("error", err => console.error(err));

bot.on("messageCreate", msg => {
    if (msg.content.match(/[a-zA-Z0-9]{32}/g)) msg.delete().catch(() => {
        return
    }); // used to prevent retarded kids leaking their auth codes in chat
});

bot.on("interactionCreate", async interaction => {
    if (interaction instanceof AutocompleteInteraction) {
        const focusedOption = interaction.data.options.find(opt => opt.focused);

        if (bot.autocompletes.has(focusedOption.name)) {
            await bot.autocompletes.get(focusedOption.name)(interaction, focusedOption);
        } else {
            interaction.acknowledge([]);
        }

        return;
    }

    interaction.userId = interaction.member?.id || interaction.user.id;

    await handleChildInteractionData(interaction);

    const cmd = interaction.data.name;
    const command = bot.commands.get(cmd);

    try {
        if (interaction.type !== 2 || !command) return;

        let userData = null;
        if (command.meta?.loginRequired) {
            const { data, error } = await supabase.from(config.database.table).select().match({ discordId: interaction.userId });
            if (error) throw new Error("A database lookup error has occured!");
            userData = data?.[0];

            if (!userData) {
                return interaction.createMessage({
                    embed: {
                        color: config.embedColors.info,
                        title: "Uh Oh!",
                        description: `Looks like you're not logged in! Please use the login command to continue.`,
                        author: { name: bot.user.username, icon_url: bot.user.avatarURL },
                    },
                    flags: 64
                });
            }
        }

        await command.exec(bot, interaction, interaction.data.options, api, config, userData, supabase);

        bot.interactions.delete(interaction.id); // clean up the interactions map

    } catch (e) {

        console.log(e);

        const error = tryParseJson(e.message);

        const content = {
            embed: {
                title: ":x: Something went wrong! :x:",
                description: `\`\`\`yml\n${typeof error === "object" ? epicErrorParser(error) : error}\n\`\`\``,
                color: config.embedColors.error,
                author: {
                    name: 'Razor Bot',
                    icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280'
                }
            },
            components: [],
            flags: cmd === "login" ? 64 : 0
        };

        if (interaction.acknowledged) {
            interaction.editOriginalMessage(content);
        } else {
            interaction.createMessage(content);
        };

        bot.createMessage(config.channels.errors, {
            embed: {
                title: `An error occured when executing the \`${cmd}\` command`,
                description: `\`\`\`js\n${e}\n\`\`\``,
                color: config.embedColors.error,
                author: {
                    name: 'Razor Bot',
                    icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280'
                }
            }
        });
    }
    ;
});

function epicErrorParser(error) {
    const errors = {
        1023: "This account is banned or has yet to accept the eula."
    };

    return errors[error.numericErrorCode] || error.errorMessage;
};

function tryParseJson(data) {
    const splitData = data.split("");
    if (/\[|\{/.test(splitData[0]) && /\]|\}/.test(splitData[splitData.length - 1])) return JSON.parse(data);

    return data;
};

async function handleChildInteractionData(interaction) {
    const parentInteractionId = interaction.message?.interaction.id;
    if (!parentInteractionId) return bot.interactions.set(interaction.id, { userId: interaction.userId });

    if (!bot.interactions.has(parentInteractionId)) return;

    const oldData = bot.interactions.get(parentInteractionId);
    if (oldData.userId !== interaction.userId) return;

    bot.interactions.set(parentInteractionId, {
        ...oldData,
        [`${interaction.data.component_type === 2 ? "btn" : "select"}Data`]: interaction.data
    });

    await interaction.acknowledge({});

    const ogMessage = interaction.message;
    const ogComponents = ogMessage.components;

    for (let i = 0; i < ogComponents.length; i++) {
        const subComponents = ogComponents[i].components;

        for (let j = 0; j < subComponents.length; j++) {
            if (subComponents[j].custom_id === interaction.data.custom_id && subComponents[j].type === 3) {
                for (let m = 0; m < subComponents[j].options.length; m++) {
                    if (subComponents[j].options[m].value === interaction.data.values[0]) subComponents[j].options[m].default = true;
                }
                ;
            }
            ;

            if (subComponents[j].type === interaction.data.component_type) subComponents[j].disabled = true;
        }
        ;
    }
    ;

    interaction.editOriginalMessage({
        embed: ogMessage.embeds[0],
        components: ogComponents
    });
};

function buildPresetList(count) {
    const res = [];
    for (let i = 1; i < count + 1; i++) {
        res.push({ label: `Preset ${i}`, value: i });
    }
    ;
    return res;
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Gracefully shutting down...');
    
    // Disconnect Discord bot
    bot.disconnect();
    console.log('Discord bot disconnected.');

    process.exit(0);
});

bot.connect();
