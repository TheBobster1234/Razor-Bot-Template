import fs from "fs";
import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (bot, interaction, _args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);

        try {

            const sessionInfo = await api.realPlayersOperation(auth.account_id, auth.access_token, {});
            const playerAmount = sessionInfo[0].totalPlayers

            console.log(playerAmount);

            interaction.createMessage({
                embed: {
                    color: config.embedColors.success,
                    title: "Real Players Count!",
                    description: `There's currently **${playerAmount}** real players in your match!`,
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                }, components: []
            })
        } catch (error) {
            interaction.createMessage({
                embed: {
                    color: config.embedColors.error,
                    title: `You're not in a match!`,
                    description: "This command only works while you are loaded into a game.",
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                }, components: []
            })
        }
    },
    info: {
        name: "real-players",
        description: "Displays the amount of real players that are in your current game!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: true
        //loadoutPopup: false
    }
};