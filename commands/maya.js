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
        const items = profile.profileChanges[0].profile.items;

        const variantNames = { "boots": "Particle", "vest": "Progressive", "sleeves": "ClothingColor", "helmet": "Parts", "hairstyle": "Hair", "shirt-color": "Material", "pants-color": "JerseyColor", "tattoos": "Emissive", "face-paint": "Mesh" };
        const defaultVariants = { JerseyColor: "Mat10", Parts: "Stage6", Emissive: "Emissive1", Mesh: "Color.009", Hair: "Color.014", Particle: "Particle1", ClothingColor: "Color.003", Progressive: "Stage1", Material: "Mat1" };
        const ownedVariants = {};
        for (const item in items) {
            const value = items[item];
            if (value.templateId === "AthenaCharacter:cid_695_athena_commando_f_desertopscamo") {
                for (const variant of value.attributes.variants) {
                    ownedVariants[variant.channel] = variant.owned[0];
                };
            };
        };

        const variantUpdates = [];
        for (const arg of args) {
            const variant = variantNames[arg.name];
            variantUpdates.push({
                channel: variant,
                active: (arg.value === "unlocked" ? ownedVariants[variant] : defaultVariants[variant]) || defaultVariants[variant],
                owned: []
            });
        };

        await api.profileOperation(auth.account_id, saveData.gamemode, "SetCosmeticLockerSlot", auth.access_token, {
            lockerItem: locker, category: "Character", itemToSlot: "AthenaCharacter:cid_695_athena_commando_f_desertopscamo", slotIndex: 0,
            variantUpdates: variantUpdates,
            optLockerUseCountOverride: -1
        });

        interaction.editOriginalMessage({
            embed: {
                color: config.embedColors.success,
                title: "Set your maya skin configuration!",
                description: `Successfully saved your maya skin loadout to preset #${saveData.presetId} in ${saveData.gamemode === "athena" ? "Battle Royale" : "Save the World"}!`
            }, components: []
        }).catch(err => { return });
    },
    info: {
        name: "maya",
        description: "Saves a maya skin configuration of your choosing to your locker slot!",
        options: [
            {
                "name": "boots",
                "description": "Style of boots",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "vest",
                "description": "Style of vest",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "sleeves",
                "description": "Style of sleeves",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "helmet",
                "description": "Style of helmet",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "hairstyle",
                "description": "Style of hairstyle",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "shirt-color",
                "description": "Style of shirt color",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "pants-color",
                "description": "Style of pants color",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "tattoos",
                "description": "Style of tattoos",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
                ]
            },
            {
                "name": "face-paint",
                "description": "Style of face paint",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Default", "value": "default" },
                    { "name": "Unlocked", "value": "unlocked" }
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