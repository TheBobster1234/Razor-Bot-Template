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

        await api.profileOperation(auth.account_id, saveData.gamemode, "SetCosmeticLockerSlot", auth.access_token, { lockerItem: locker, category: "Backpack", itemToSlot: `AthenaBackpack:${args[0].value}`, slotIndex: 0,
            variantUpdates: [
                { channel: "Numeric", active: `ItemTexture.AthenaDance:${spray}`, owned: [] }
            ],
            optLockerUseCountOverride: -1
        });

        interaction.editOriginalMessage({ embed: {
            color: config.embedColors.success,
            title: "Set your backbling configuration!",
            description: `Successfully saved your ${args[0].name} backbling loadout to preset #${saveData.presetId} in ${saveData.gamemode === "athena" ? "Battle Royale" : "Save the World"}!`
        }, components: [] }).catch(err => { return });
    },
    info: {
        name: "modherobling",
        description: "Allows you to easily apply special styles for backblings in the 'boundless' & 'fallen heroes' sets.",
        options: [
            {
                "name": "item",
                "description": "The name of the backbling you want to modify.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Holo-Back", value: "bid_610_elastichologram" },
                    { "name": "Dead Pixels", value: "bid_895_zombieelasticneon" },
                    { "name": "Emoticape", value: "bid_609_elasticcape" }
                ]
            },
            {
                "name": "spray",
                "description": "The name of the spray you would like applied to your backbling.",
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