import { Constants } from "eris";
import defs from "../api/defs.js";

export default {
    exec: async (bot, interaction, _args, api, config, loginData, supabase) => {
        if (loginData) return interaction.createMessage({
            embeds: [{
                color: config.embedColors.error,
                title: "Already logged in!",
                description: "You must logout before logging in with a new account!",
                author: { name: bot.user.username, icon_url: bot.user.avatarURL }
            }],
            flags: 64 // Ephemeral flag
        }).catch(() => { });

        const user = interaction.member?.id || interaction.user.id;

        const clientCredentials = await api.login(defs.PS4_US_CLIENT, defs.PS4_US_SECRET, { grant_type: "client_credentials", eg1: true });
        const deviceAuthorizationFlowData = await api.auth.startDeviceAuthorizationFlow(clientCredentials);

        // --- TIMESTAMP ---
        // Calculate the exact time 3 minutes from now as a Unix timestamp.
        const timeoutSeconds = 180;
        const expirationTimestamp = Math.floor((Date.now() / 1000) + timeoutSeconds);

        await interaction.createMessage({
            embeds: [{
                color: 0xFB5A32,
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                },
                title: "Login",
                // Use the calculated timestamp in the description string.
                description: `**Login Instructions:**\n**1.** Click the \`Login\` button below.\n**2.** Click the \`Confirm\` button on the Epic Games page.\n**3.** Wait a few seconds for the bot to process login.\n\n*This interaction will timeout <t:${expirationTimestamp}:R>.*`,
            }],
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.LINK,
                            label: "Login",
                            url: deviceAuthorizationFlowData.verification_uri_complete,
                        },
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.DANGER,
                            label: "Cancel",
                            custom_id: "cancel",
                        }
                    ],
                }
            ],
            flags: 64 // Ephemeral flag
        });

        try {
            const deviceCodeCredentials = await api.waitForDeviceCodeFlowComplete(deviceAuthorizationFlowData, timeoutSeconds * 1000); // Use variable
            const exchangeCodeResponse = await api.generateExchangeCode(deviceCodeCredentials);
            const androidCredentials = await api.login(defs.ANDROID_CLIENT, defs.ANDROID_SECRET, { grant_type: "exchange_code", exchange_code: exchangeCodeResponse.code, eg1: true });
            const deviceAuth = await api.createDeviceAuth(androidCredentials);

            const { data, error } = await supabase.from(config.database.table).insert([
                {
                    discordId: user,
                    accountId: deviceAuth.accountId,
                    deviceId: deviceAuth.deviceId,
                    secret: deviceAuth.secret,
                }
            ]);
            if (error) throw new Error(error.message);

            await interaction.editOriginalMessage({
                embeds: [{
                    color: config.embedColors.success,
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    },
                    title: "Successfully logged in!",
                    description: "You have been logged in and your auth is saved for future commands. If you wish to remove your auth you can use the </logout:1254646514354225283> command!"
                }],
                components: []
            }).catch(() => { });
        } catch (err) {
            console.log(err.message);
            // Check for the correct error message from fnbr.js
            if (err.message && err.message.includes("timed_out")) {
                await interaction.editOriginalMessage({
                    embeds: [{
                        color: config.embedColors.error,
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                        },
                        title: "Whoops!",
                        description: "The login flow has expired. Please use the </login:1379426917090066505> command to try again."
                    }],
                    components: []
                }).catch(() => { });
            } else {
                await interaction.editOriginalMessage({
                    embeds: [{
                        color: config.embedColors.error,
                        title: "Login Failed",
                        description: `An error occurred during login: ${err.message}`,
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                        }
                    }],
                    components: []
                }).catch(() => { });
            };
        };
    },
    info: {
        name: "login",
        description: "Generates a private login url for you to grant permission to the bot.",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: []
    },
    meta: {
        loginRequired: false,
        loadoutPopup: false
    }
};
