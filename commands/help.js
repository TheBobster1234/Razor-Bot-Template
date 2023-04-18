import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (_bot, interaction, _args, _api, config, _loginData, _supabase) => {
        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "To get started login with the button below!",
                description: "Get your 32 character auth code from the link below, then use the `/login` command and provide the 32 character auth code.\n\n:warning: Be quick because auth codes expire very quickly! :warning:",
                image: {
                    url: "attachment://auth.png"
                }
            },
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.LINK,
                            label: "Click here to get your auth code!",
                            url: "https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fid%2Fapi%2Fredirect%3FclientId%3D3446cd72694c4a4485d81b77adbb2141%26responseType%3Dcode&prompt=login",
                            disabled: false
                        }
                    ]
                }
            ],
            flags: 64
        }, { file: fs.readFileSync("./assets/authCode.png"), name: "auth.png" });
    },
    info: {
        name: "help",
        description: "Gives an explaination of how to get started using the bot!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: false,
        loadoutPopup: false
    }
};