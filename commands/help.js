import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (_bot, interaction, _args, _api, config, _loginData, _supabase) => {
        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "To get started, login with the button below!",
                description: `Get your 32 character auth code from the link below, then use the </login:1254646512885956683> command and provide the 32 character auth code.\n\n:warning: **Be quick because auth codes expire very quickly!** :warning:\n\n**Click "Get auth code!" to get a auth code from your signed in Epic account.**\n\n**Click "Switch account?" if you want to get a auth code from a different Epic account.**`,
                image: {
                    url: "attachment://auth.png"
                },
                author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
            },
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.LINK,
                            label: "Get auth code!",
                            url: "https://www.epicgames.com/id/api/redirect?clientId=3f69e56c7649492c8cc29f1af08a8a12&responseType=code",
                            disabled: false
                        },
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.LINK,
                            label: "Switch accounts?",
                            url: "https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fid%2Fapi%2Fredirect%3FclientId%3D3f69e56c7649492c8cc29f1af08a8a12%26responseType%3Dcode&prompt=login",
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
        loginRequired: false
        //loadoutPopup: false
    }
};