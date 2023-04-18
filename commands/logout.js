import { Constants } from "eris";

export default {
    exec: async (_bot, interaction, _args, _api, config, loginData, supabase) => {
        if (!loginData) return interaction.createMessage({
            embed: {
                color: config.embedColors.error,
                title: "Not logged in!",
                description: "You are not currently logged into an account! To login use the `/login` command."
            },
        }).catch(err => { return });

        const user = interaction.member?.id || interaction.user.id;
        const { error } = await supabase.from(config.database.table).delete().match({ discordId: user });
        if (error) throw new Error(error); // hopefully this never actually happens :)

        interaction.createMessage({
            embed: {
                color: config.embedColors.success,
                title: "Successfully logged out!",
                description: "You have been logged out and all stored account data has been deleted! You can log in again using the `/login` command!"
            },
        }).catch(err => { return });
    },
    info: {
        name: "logout",
        description: "Logs you out of the bot!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: false,
        loadoutPopup: false
    }
};
