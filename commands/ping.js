import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (_bot, interaction, _args, _api, config, _loginData, _supabase) => {
        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "Pong!",
                author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
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