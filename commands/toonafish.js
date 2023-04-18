import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);

        const saveData = bot.interactions.get(interaction.id);

        const profile = await api.profileOperation(auth.account_id, saveData.gamemode, "QueryProfile", auth.access_token, {
            sourceIndex: 0,
            targetIndex: 1,
            optNewNameForTarget: "Slate <3"
        });

        const loadouts = profile.profileChanges[0].profile.stats.attributes.loadouts;
        const locker = loadouts[saveData.presetId];

        await api.profileOperation(auth.account_id, saveData.gamemode, "SetCosmeticLockerSlot", auth.access_token, { lockerItem: locker, category: "Character", itemToSlot: "AthenaCharacter:cid_a_201_athena_commando_m_teriyakifishtoon", slotIndex: 0,
            variantUpdates: [
                {
                    channel: "Particle",
                    active: "Mat2",
                    owned: []
                },
                {
                    channel: "Material",
                    active: `Color.${args[0].value}`, // mat
                    owned: []
                },
                {
                    channel: "JerseyColor",
                    active: `Color.${args[1].value}`, // face color
                    owned: []
                }
            ],
            optLockerUseCountOverride: -1
        });

        interaction.editOriginalMessage({ embed: {
            color: config.embedColors.success,
            title: "Set your toona fish skin configuration!",
            description: `Successfully saved your toona fish skin loadout to preset #${saveData.presetId} in ${saveData.gamemode === "athena" ? "Battle Royale" : "Save the World"}!`
        }, components: [] }).catch(err => { return });
    },
    info: {
        name: "toonafish",
        description: "Saves a toona fish skin configuration of your choosing to your locker slot!",
        options: [
            {
                "name": "character",
                "description": "The name of the character color palete you wish for the skin's body to be.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Fabio Sparklemane", "value": "042" },
                    { "name": "Snowheart", "value": "016" }
                ]
            },
            {
                "name": "color",
                "description": "The name of the color you wish the skin's head to be.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Plain White", "value": "000" },
                    { "name": "Knightly Crimson", "value": "001" },
                    { "name": "Y-Labs Magenta", "value": "002" },
                    { "name": "Cuddly Pink", "value": "003" },
                    { "name": "Ruby Red", "value": "004" },
                    { "name": "Renegade Red", "value": "005" },
                    { "name": "Pumpkin Orange", "value": "006" },
                    { "name": "Midas Gold", "value": "007" },
                    { "name": "Desert Sand", "value": "008" },
                    { "name": "Banana Yellow", "value": "009" },
                    { "name": "Leafy Green", "value": "010" },
                    { "name": "Recruit Green", "value": "011" },
                    { "name": "Codename G.R.N.", "value": "012" },
                    { "name": "Ghoulish Green", "value": "013" },
                    { "name": "Slurp Turquoise", "value": "014" },
                    { "name": "Diamond Blue", "value": "015" },
                    { "name": "Frozen Blue", "value": "016" },
                    { "name": "Crystalline Blue", "value": "017" },
                    { "name": "Brite Purple", "value": "018" },
                    { "name": "Mezmerizing Violet", "value": "019" },
                    { "name": "Robotic Grey", "value": "020" },
                    { "name": "Stone Grey", "value": "021" }
                ]
            }
        ],
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: true,
        loadoutPopup: true
    }
};