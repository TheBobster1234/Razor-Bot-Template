import fs from "fs";
import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, _args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);

        const brProfile = await api.profileOperation(auth.account_id, "athena", "QueryProfile", auth.access_token, {});
        const brLevel = brProfile.profileChanges[0].profile.stats.attributes.level;
        const accountLevel = brProfile.profileChanges[0].profile.stats.attributes.accountLevel;
        console.log(brLevel);
        console.log(auth.access_token);


        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                //title: "**Levels:**",
                fields: [
                    {
                        name: `Battle Royale`,
                        value: brLevel,
                        inline: false
                    },
                    {
                        name: 'Account Level',
                        value: accountLevel,
                        inline: false
                    }
                ],
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                }
            },
        });
    },
    info: {
        name: "level",
        description: "Displays your BR and account level!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: true
        //loadoutPopup: false
    }
};