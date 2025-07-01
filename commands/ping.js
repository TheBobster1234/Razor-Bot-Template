import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (_bot, interaction, _args, _api, config, _loginData, _supabase) => {
        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "Pong!",
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                }
            },
        });
    },
    info: {
        name: "ping",
        description: "Used to see if the bot is working!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: false
        //loadoutPopup: false
    }
};