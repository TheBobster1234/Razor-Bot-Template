import { promises as fs } from "fs";
import Eris, { Constants, AutocompleteInteraction } from "eris";
import { createClient } from "@supabase/supabase-js";
import Api from "./api/index.js";
import config from "./config.js";
import { clearInterval } from "timers";
import fnbr from 'fnbr'; // Import fnbr for Fortnite client

const bot = new Eris(config.token, { intents: ["guildMessages"], intents: ["guilds"] });
const api = new Api();
await api.cosmetics.setupCache();
const supabase = createClient(config.database.url, config.database.key);

// Initialize global storage for Fortnite clients
global.fortniteClients = {};

bot.commands = new Map();
bot.interactions = new Map();
bot.autocompletes = new Map();

const desiredCosmeticTypes = ["Outfit", "Emote", "Pickaxe", "Back Bling", "Shoes"];
bot.autocompletes.set("name-or-id", (interaction, focusedOption) => {
    const choices = api.cosmetics.cosmeticCache
        .filter(cosmetic => desiredCosmeticTypes.includes(cosmetic.type.displayValue))
        .filter(cosmetic => cosmetic.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
        .map(cosmetic => {
            return { name: `${cosmetic.name} - ${cosmetic.type.displayValue}`, value: cosmetic.id.toLowerCase() }
        })
        .slice(0, 25);
    interaction.acknowledge(choices);
});
bot.autocompletes.set("style", (interaction, focusedOption) => {
    const itemNameOrId = interaction.data.options.find(opt => opt.name === "name-or-id").value.toLowerCase();
    const { variants } = api.cosmetics.cosmeticCache
        .filter(cosmetic => desiredCosmeticTypes.includes(cosmetic.type.displayValue))
        .find(cosmetic => cosmetic.name.toLowerCase() === itemNameOrId || cosmetic.id.toLowerCase() === itemNameOrId) || []

    if (!variants) {
        return;
    }

    const choices = variants.map(variant => variant.options.map(option => {
        return { ...option, name: `${option.name} (${option.tag}) - ${variant.channel}` }
    }))
        .flat()
        .map(variant => {
            return { name: variant.name, value: variant.tag }
        })
        .slice(0, 25);

    console.log(choices);

    if (choices) interaction.acknowledge(choices);
});


// Function to start a Fortnite client for a user (lobby bot)
async function startFortniteClient(userData) {
    try {
        if (!userData || !userData.deviceId || !userData.accountId || !userData.secret) {
            console.error("Invalid user data for starting Fortnite client:", userData);
            return null;
        }

        //console.log(`Starting Fortnite client for user: ${userData.discordId} (${userData.accountId})`);

        // Create device auth credentials object
        const deviceAuth = {
            accountId: userData.accountId,
            deviceId: userData.deviceId,
            secret: userData.secret
        };

        // Create Fortnite client with device auth
        const fortniteClient = new fnbr.Client({
            auth: {
                deviceAuth: deviceAuth,
                killOtherTokens: true // Allow multiple devices to be logged in at once
            },
            createParty: true, // Auto-create party when logging in
            partyConfig: {
                joinConfirmation: false, // Don't require confirmation to join the party
                chatEnabled: true, // Enable party chat
                joinableWhenFull: false
            }
        });

        // Monitor when client is ready
        fortniteClient.on('ready', () => {
            //console.log(`Fortnite client ready: ${fortniteClient.user.displayName} (${fortniteClient.user.id})`);

            // Set custom status message instead of sending chat message
            fortniteClient.setStatus("Created by Razor! discord.gg/rgGRay6fgG");
        });

        // Handle potential errors
        fortniteClient.on('error', (error) => {
            console.error(`Error in Fortnite client for ${userData.discordId}:`, error);
        });

        // Log in the client
        await fortniteClient.login();
        //console.log(`Successfully logged in Fortnite client for ${userData.discordId} (${fortniteClient.user.displayName})`);

        // Store the client in our global map
        global.fortniteClients[userData.discordId] = fortniteClient;
        return fortniteClient;

    } catch (error) {
        console.error(`Error starting Fortnite client for ${userData?.discordId || 'unknown user'}:`, error);
        return null;
    }
}

// Function to start all stored lobby bot clients
async function startAllStoredClients() {
    try {
        console.log("Starting all stored lobby bot clients...");

        // Get all stored lobby bot accounts from Supabase (different table)
        const { data, error } = await supabase.from(config.database.lobbyBotsTable).select();

        if (error) {
            console.error("Error fetching lobby bot accounts from database:", error);
            return;
        }

        if (!data || data.length === 0) {
            console.log("No stored lobby bot accounts found in database.");
            return;
        }

        console.log(`Found ${data.length} stored lobby bot accounts. Starting clients...`);

        // Start a client for each stored account
        const startPromises = data.map(async (userData) => {
            try {
                await startFortniteClient(userData);
                return true;
            } catch (e) {
                console.error(`Failed to start lobby bot client for user ${userData.discordId}:`, e);
                return false;
            }
        });

        const results = await Promise.allSettled(startPromises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;

        console.log(`Successfully started ${successful} out of ${data.length} lobby bot clients.`);

    } catch (error) {
        console.error("Error starting stored lobby bot clients:", error);
    }
}

bot.once("ready", async () => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online in ${bot.guilds.size}!`);
    updateStatus();

    // Start all stored lobby bot clients when the bot comes online
    await startAllStoredClients();

    //bot.deleteCommand("1361373611637735524");

    //console.log(bot.guilds)

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
        // [ { value: 'nfghewdfm', type: 3, name: 'name-or-id', focused: true } ]
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
        if (interaction.type !== 2) return;

        // Check which database table to use based on command
        let tableName = config.database.table; // Default to ghost equip table
        let userData = null;

        if (command?.meta?.isLobbyBot) {
            // Use lobby bots table for lobby bot commands
            tableName = config.database.lobbyBotsTable;
        }

        const { data, error } = await supabase.from(tableName).select().match({ discordId: interaction.userId });
        if (error) throw new Error("A database lookup error has occured!");

        userData = data[0];

        if (command?.meta?.loginRequired && !userData) {
            // Show appropriate login warning based on command type
            return command?.meta?.isLobbyBot ? await showLobbyBotLoginWarn(interaction) : await showLoginWarn(interaction);
        }

        // Pass the table name to the command so it knows which database to use
        await command.exec(bot, interaction, interaction.data.options, api, config, userData, supabase, tableName);

        bot.interactions.delete(interaction.id); // clean up the interactions map so no children will be listened to once the command has finished

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
            flags: cmd === "login" || cmd === "lblogin" ? 64 : 0
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

// Original login warning for ghost equip
async function showLoginWarn(interaction) {
    interaction.createMessage({
        embed: {
            color: config.embedColors.info,
            title: "Uh Oh!",
            description: `Looks like you're not logged in! Use </login:1379426917090066505> to login!`,
            author: { name: bot.user.username, icon_url: bot.user.avatarURL },
        },
        flags: 64
    });
};

// New login warning for lobby bots
async function showLobbyBotLoginWarn(interaction) {
    interaction.createMessage({
        embed: {
            color: config.embedColors.info,
            title: "To get started with lobby bots, login with the button below!",
            description: `Get your 32 character auth code from the link below, then use the </lblogin:COMMAND_ID> command and provide the 32 character auth code.\n\n:warning: **Be quick because auth codes expire very quickly!** :warning:\n\n**This will create a lobby bot account separate from your ghost equip account.**\n\n**Click "Get auth code!" to get a auth code from your signed in Epic account.**\n\n**Click "Switch account?" if you want to get a auth code from a different Epic account.**`,
            image: {
                url: "attachment://auth.png"
            },
            author: {
                name: 'Razor Bot',
                icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280'
            }
        },
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.LINK,
                        label: "Click here to get your auth code!",
                        url: "https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fid%2Fapi%2Fredirect%3FclientId%3D3f69e56c7649492c8cc29f1af08a8a12%26responseType%3Dcode&prompt=login",
                        disabled: false
                    }
                ]
            }
        ],
        flags: 64
    }, { file: await fs.readFile("./assets/authCode.png"), name: "auth.png" });
};

function epicErrorParser(error) {
    const errors = {
        //16027: `Unable to save the loadout because you do not own the item: ${error.messageVars[0]}`,
        //1040: data.errorMessage,
        1023: "This account is banned or has yet to accept the eula." // banned or does not posses action 'PLAY'
    };

    return errors[error.numericErrorCode] || error.errorMessage;
};

function tryParseJson(data) {
    const splitData = data.split("");
    if (/\[|\{/.test(splitData[0]) && /\]|\}/.test(splitData[splitData.length - 1])) return JSON.parse(data);

    return data;
};

async function handleChildInteractionData(interaction) { // shit function that isn't at all versatile.
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

// Export functions for lobby bot management (can be used by commands)
export { startFortniteClient };

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Gracefully shutting down...');

    // Logout all Fortnite clients
    const logoutPromises = Object.values(global.fortniteClients).map(client => {
        try {
            return client.logout();
        } catch (e) {
            return Promise.resolve();
        }
    });

    await Promise.allSettled(logoutPromises);
    console.log('All Fortnite clients have been logged out.');

    // Disconnect Discord bot
    bot.disconnect();
    console.log('Discord bot disconnected.');

    process.exit(0);
});

bot.connect();