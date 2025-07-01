import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (bot, interaction, _args, _api, config, _loginData, _supabase) => {
        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "About Razor Bot!",
                description: "Razor is managed by [Bobster](https://discordapp.com/users/198439918647771136) and is a Fortnite Discord Bot based off of a open sourced bot called [Storm King Bot](https://github.com/8h9x/storm-king), which was created by [Distrust](https://discordapp.com/users/908900960791834674). Razor has more and updated commands.",
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                }
            },
        });
    },
    info: {
        name: "about",
        description: "Gives a short explaination about the bot!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: false
        //loadoutPopup: false
    }
};