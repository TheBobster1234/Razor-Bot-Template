import { Constants } from "eris";

export default {
    exec: async (_bot, interaction, _args, api, config, loginData, supabase) => {
        if (loginData) return interaction.createMessage({
            embed: {
                color: config.embedColors.error,
                title: "Already logged in!",
                description: "You must logout before logging in with a new account!"
            },
        }).catch(err => { return });

        const user = interaction.member?.id || interaction.user.id;
        const code = interaction.data.options[0].value;
        const auth = await api.login({ method: "code", value: code });
        const deviceAuth = await api.createDeviceAuth(auth);

        const { data, error } = await supabase.from(config.database.table).insert([
            {
                discordId: user,
                accountId: deviceAuth.accountId,
                deviceId: deviceAuth.deviceId,
                secret: deviceAuth.secret,
            }
        ]);
        if (error) throw new Error(error); // hopefully this never actually happens :)

        interaction.createMessage({
            embed: {
                color: config.embedColors.success,
                title: "Successfully logged in!",
                description: "You have been logged in and your auth is saved for future commands. If you wish to remove your auth you can use the `/logout` command!"
            },
            flags: 64
        }).catch(err => { return });
    },
    info: {
        name: "login",
        description: "Logs you in so you can start using commands!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [
            {
                "name": "code",
                "description": "The authorization code that you get from the epic games sign-in link.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true
            }
        ]
    },
    meta: {
        loginRequired: false,
        loadoutPopup: false
    }
};
