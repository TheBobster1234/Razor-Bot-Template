import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);

        const saveData = bot.interactions.get(interaction.id);

        const profile = await api.profileOperation(auth.account_id, saveData.gamemode, "QueryProfile", auth.access_token, {});

        const loadouts = profile.profileChanges[0].profile.stats.attributes.loadouts;
        const locker = loadouts[saveData.presetId];
        const spray = args[1]?.value ? await api.cosmeticLookup(args[1].value, "AthenaSpray") : "";

        await api.profileOperation(auth.account_id, saveData.gamemode, "SetCosmeticLockerSlot", auth.access_token, { lockerItem: locker, category: "Character", itemToSlot: `AthenaCharacter:${args[0].value}`, slotIndex: 0,
            variantUpdates: [
                { channel: "Numeric", active: `ItemTexture.AthenaDance:${spray}`, owned: [] }
            ],
            optLockerUseCountOverride: -1
        });

        interaction.editOriginalMessage({ embed: {
            color: config.embedColors.success,
            title: "Set your superhero skin configuration!",
            description: `Successfully saved your superhero skin loadout to preset #${saveData.presetId} in ${saveData.gamemode === "athena" ? "Battle Royale" : "Save the World"}!`
        }, components: [] }).catch(err => { return });
    },
    info: {
        name: "modheroskin",
        description: "Allows you to easily apply special styles for skins in the 'boundless' & 'fallen heroes' sets.",
        options: [
            {
                "name": "skin",
                "description": "The skin you wish to modify.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Hunter", "value": "cid_855_athena_commando_m_elastic" },
                    { "name": "Blastoff", "value": "cid_857_athena_commando_m_elastic_c" },
                    { "name": "The Mighty Volt", "value": "cid_859_athena_commando_m_elastic_e" },
                    { "name": "Joltara", "value": "cid_864_athena_commando_f_elastic_e" },
                    { "name": "Firebrand", "value": "cid_862_athena_commando_f_elastic_c" },
                    { "name": "Dynamo Dancer", "value": "cid_860_athena_commando_f_elastic" },
                    { "name": "Wanderlust", "value": "cid_858_athena_commando_m_elastic_d" },
                    { "name": "Hypersonic", "value": "cid_856_athena_commando_m_elastic_b" },
                    { "name": "Backlash", "value": "cid_861_athena_commando_f_elastic_b" },
                    { "name": "Polarity", "value": "cid_863_athena_commando_f_elastic_d" }
                ]
            },
            {
                "name": "spray",
                "description": "The name of the spray you would like applied to your skin.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true
            }
        ]
    },
    meta: {
        loginRequired: true,
        loadoutPopup: true
    }
};