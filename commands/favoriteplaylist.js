import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, _args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);
        const id = interaction.data.options[0].value;

        await api.addFavoritePlaylist(auth.account_id, id.toLowerCase(), auth.access_token);

        interaction.createMessage({
            embed: {
                color: config.embedColors.success,
                title: "Successfully favorited playlist!",
                description: `Playlist: \`${id}\` has been successfully added to your in-game favorites list!`,
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                }
            },
        }).catch(err => { return });
    },
    info: {
        name: "favoriteplaylist",
        description: "Adds a playlist to your in-game favorites list!",
        options: [
            {
                "name": "playlist",
                "description": "The id of the playlist (or creative map code) you wish to favorite.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true
            }
        ],
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: true,
        loadoutPopup: false
    }
};
