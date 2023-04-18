import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);

        const saveData = bot.interactions.get(interaction.id);

        const profile = await api.profileOperation(auth.account_id, saveData.gamemode, "QueryProfile", auth.access_token, {});

        const loadouts = profile.profileChanges[0].profile.stats.attributes.loadouts;
        const locker = loadouts[saveData.presetId];
        const emoticon = args[0]?.value ? await api.cosmeticLookup(args[0].value, "AthenaEmoji") : "";

        await api.profileOperation(auth.account_id, saveData.gamemode, "SetCosmeticLockerSlot", auth.access_token, { lockerItem: locker, category: "Pickaxe", itemToSlot: "AthenaPickaxe:pickaxe_basil", slotIndex: 0,
            variantUpdates: [
                { channel: "Numeric", active: `ItemTexture.AthenaDance:${emoticon}`, owned: [] }
            ],
            optLockerUseCountOverride: -1
        });

        interaction.editOriginalMessage({ embed: {
            color: config.embedColors.success,
            title: "Set your pickaxe configuration!",
            description: `Successfully saved your demolisher pickaxe loadout to preset #${saveData.presetId} in ${saveData.gamemode === "athena" ? "Battle Royale" : "Save the World"}!`
        }, components: [] }).catch(err => { return });
    },
    info: {
        name: "demolisherpick",
        description: "Can set emoticon instead of spray on demolisher pickaxe.",
        options: [
            {
                "name": "emoticon",
                "description": "The name of the emoticon you would like applied to your pickaxe.",
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