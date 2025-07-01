import fs from "fs";
import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (_bot, interaction, _args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);
        console.log(auth);


        interaction.createMessage({
            embed: {
                color: config.embedColors.success,
                title: "Success! Here is your device auth!",
                description: ":warning: **WARNING! DO NOT SHARE THIS INFO WITH ANYONE!** :warning:",
                fields: [
                            {
                                name: `**Account ID**`, 
                                value: `\`\`\`js\n${loginData.accountId}\n\`\`\``, 
                                inline: false
                            },
                            {
                                name: '**Device ID**', 
                                value: `||${loginData.deviceId}||`, 
                                inline: false
                            },
                            {
                                name: `**Secret**`, 
                                value: `||${loginData.secret}||`, 
                                inline: false
                            }
                        ],
                author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
            }, components: [],
            flags: 64
        }).catch(err => {
            return
        });
    },
    info: {
        name: "deviceauth",
        description: "Will give you your device auth!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: true
        //loadoutPopup: false
    }
};