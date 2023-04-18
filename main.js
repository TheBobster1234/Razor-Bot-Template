import { promises as fs } from "fs";
import Eris, { Constants } from "eris";
import { createClient } from "@supabase/supabase-js";
import Api from "./api/index.js";
import config from "./config.js";
import { clearInterval } from "timers";

const bot = new Eris(config.token, { intents: [ "guildMessages" ] });
const api = new Api();
const supabase = createClient(config.database.url, config.database.key);

bot.commands = new Map();
bot.interactions = new Map();

bot.once("ready", async () => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online!`);

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
                } else {
                    continue;
                };
            } else {
                await bot.createCommand({ ...props.info, type: Constants.ApplicationCommandTypes.CHAT_INPUT });
            };
        } catch (err) {
            console.log(props.info.name, err);
        };
    };
});

bot.on("error", err => console.error(err));

bot.on("messageCreate", msg => {
    if (msg.content.match(/[a-zA-Z0-9]{32}/g)) msg.delete().catch(() => { return }); // used to prevent retarded kids leaking their auth codes in chat
});

bot.on("interactionCreate", async interaction => {
    interaction.userId = interaction.member?.id || interaction.user.id;

    await handleChildInteractionData(interaction);

    const cmd = interaction.data.name;
    const command = bot.commands.get(cmd);

    try {
        if (interaction.type !== 2) return;

        const { data, error } = await supabase.from(config.database.table).select().match({ discordId: interaction.userId });
        if (error) throw new Error("A database lookup error has occured!");

        if (command?.meta?.loginRequired && !data[0]) return await showLoginWarn(interaction);
        if (command?.meta?.loadoutPopup) await selectPresetPopup(interaction, data[0]);

        await command.exec(bot, interaction, interaction.data.options, api, config, data[0], supabase);

        bot.interactions.delete(interaction.id); // clean up the interactions map so no children will be listened to once the command has finished
    } catch(e) {
        console.log(e);

        const error = tryParseJson(e.message);

        const content = {
            embed: {
                title: ":x: Something went wrong! :x:",
                description: `\`\`\`yml\n${typeof error === "object" ? epicErrorParser(error) : error }\n\`\`\``,
                color: config.embedColors.error
            },
            components: [],
            flags: cmd === "login" ? 64 : 0
        };

        if (command.meta.loadoutPopup) {
            interaction.editOriginalMessage(content);
        } else {
            interaction.createMessage(content);
        };

        bot.createMessage(config.channels.errors, {
            embed: {
                title: `An error occured when executing the \`${cmd}\` command`,
                description: `\`\`\`js\n${e}\n\`\`\``,
                color: config.embedColors.error
            }
        });
    };
});

async function showLoginWarn(interaction) {
    interaction.createMessage({
        embed: {
            title: "Not logged in!",
            description: "Get your 32 character auth code from the link below, then use the `/login` command and provide the 32 character auth code.\n\n:warning: Be quick because auth codes expire very quickly! :warning:",
            color: config.embedColors.error,
            image: {
                url: "attachment://auth.png"
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
                        url: "https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fid%2Fapi%2Fredirect%3FclientId%3D3446cd72694c4a4485d81b77adbb2141%26responseType%3Dcode&prompt=login",
                        disabled: false
                    }
                ]
            }
        ],
        flags: 64
    }, { file: await fs.readFile("./assets/authCode.png"), name: "auth.png" });
};

async function selectPresetPopup(interaction, loginData) {
    interaction.createMessage({
        embed: {
            title: "Choose where to save the loadout!",
            description: "Please select a preset number and choose between battle royale (br) or save the world (stw) to save your loadout to that preset and mode.\n\nNOTE: If you do not make a selection within 30 seconds the command will, by default, save the items to your first preset slot in the battle royale gamemode.",
            color: config.embedColors.info
        },
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.SELECT_MENU,
                        custom_id: "preset-select",
                        placeholder: "Please select a preset number",
                        options: buildPresetList(10)
                    }
                ]
            },
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.PRIMARY,
                        label: "BR",
                        custom_id: "athena-select-btn"
                    },
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.SUCCESS,
                        label: "STW",
                        custom_id: "campaign-select-btn"
                    }
                ]
            }
        ]
    });

    const auth = await api.login({ method: "device", value: loginData });

    return new Promise((res, _rej) => {
        const collectedData = {};

        const waitingInterval = setInterval(() => {
            const collectedInteractionData = bot.interactions.get(interaction.id);
    
            if (collectedInteractionData.selectData) collectedData.presetId = collectedInteractionData.selectData.values[0];
            if (collectedInteractionData.btnData) collectedData.gamemode = collectedInteractionData.btnData.custom_id.replace("-select-btn", "");
            if (collectedInteractionData.selectData && collectedInteractionData.btnData) endWait();
        }, 1000);
    
        const waitingSleep = setTimeout(async () => {
            await endWait();
            // continue on business as usual
        }, 30000);
    
        const endWait = async () => {
            await api.profileOperation(auth.account_id, collectedData.gamemode || "athena", "CopyCosmeticLoadout", auth.access_token, {
                sourceIndex: 0,
                targetIndex: parseInt(collectedData.presetId) || 1,
                optNewNameForTarget: "Slate <3"
            });

            bot.interactions.set(interaction.id, {
                presetId: parseInt(collectedData.presetId) || 1,
                gamemode: collectedData.gamemode || "athena"
            });
            clearTimeout(waitingSleep);
            clearInterval(waitingInterval);
            res();
        };
    });
};

async function selectPlaylistPopup(interaction, loginData) {
    interaction.createMessage({
        embed: {
            title: "Choose where to save the loadout!",
            description: "Please select a preset number and choose between battle royale (br) or save the world (stw) to save your loadout to that preset and mode.\n\nNOTE: If you do not make a selection within 30 seconds the command will, by default, save the items to your first preset slot in the battle royale gamemode.",
            color: config.embedColors.info
        },
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.SELECT_MENU,
                        custom_id: "preset-select",
                        placeholder: "Please select a preset number",
                        options: buildPresetList(10)
                    }
                ]
            },
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.PRIMARY,
                        label: "BR",
                        custom_id: "athena-select-btn"
                    },
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.SUCCESS,
                        label: "STW",
                        custom_id: "campaign-select-btn"
                    }
                ]
            }
        ]
    });

    const auth = await api.login({ method: "device", value: loginData });

    return new Promise((res, _rej) => {
        const collectedData = {};

        const waitingInterval = setInterval(() => {
            const collectedInteractionData = bot.interactions.get(interaction.id);
    
            if (collectedInteractionData.selectData) collectedData.presetId = collectedInteractionData.selectData.values[0];
            if (collectedInteractionData.btnData) collectedData.gamemode = collectedInteractionData.btnData.custom_id.replace("-select-btn", "");
            if (collectedInteractionData.selectData && collectedInteractionData.btnData) endWait();
        }, 1000);
    
        const waitingSleep = setTimeout(async () => {
            await endWait();
            // continue on business as usual
        }, 30000);
    
        const endWait = async () => {
            await api.profileOperation(auth.account_id, collectedData.gamemode || "athena", "CopyCosmeticLoadout", auth.access_token, {
                sourceIndex: 0,
                targetIndex: parseInt(collectedData.presetId) || 1,
                optNewNameForTarget: "Slate <3"
            });

            bot.interactions.set(interaction.id, {
                presetId: parseInt(collectedData.presetId) || 1,
                gamemode: collectedData.gamemode || "athena"
            });
            clearTimeout(waitingSleep);
            clearInterval(waitingInterval);
            res();
        };
    });
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

    bot.interactions.set(parentInteractionId, { ...oldData, [`${interaction.data.component_type === 2 ? "btn" : "select"}Data`]: interaction.data });

    await interaction.acknowledge({});

    const ogMessage = interaction.message;
    const ogComponents = ogMessage.components;

    for (let i = 0; i < ogComponents.length; i++) {
        const subComponents = ogComponents[i].components;

        for (let j = 0; j < subComponents.length; j++) {
            if (subComponents[j].custom_id === interaction.data.custom_id && subComponents[j].type === 3) {
                for (let m = 0; m < subComponents[j].options.length; m++) {
                    if (subComponents[j].options[m].value === interaction.data.values[0]) subComponents[j].options[m].default = true;
                };
            };

            if (subComponents[j].type === interaction.data.component_type) subComponents[j].disabled = true;
        };
    };

    interaction.editOriginalMessage({
        embed: ogMessage.embeds[0],
        components: ogComponents
    });
};

function buildPresetList(count) {
    const res = [];
    for (let i = 1; i < count + 1; i++) {
        res.push({ label: `Preset ${i}`, value: i });
    };
    return res;
};

bot.connect();
