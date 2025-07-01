import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";
import { DateTime } from "luxon";

export default {
    exec: async (bot, interaction, args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);
        //console.log(loginData);

        /*await api.profileOperation(auth.account_id, "theater0", "LockProfileForWrite", auth.access_token, {
                code: "db521fe6a4c54ddcb8d46a20009a6a45:theater0", // Unkown
                timeout: 0 // How long the writing should be locked
        });*/

        const profileTheater0 = await api.profileOperation(auth.account_id, "theater0", "QueryProfile", auth.access_token, {});

        const expirationTime = profileTheater0.profileChanges[0].profile.profileLockExpiration
        console.log(expirationTime);

        console.log(auth.access_token);

        function convertToEasternTime(azostDateTimeStr) {
            // Parse the AZOST date-time string
            const azostDateTime = DateTime.fromISO(azostDateTimeStr, { zone: 'Atlantic/Azores' });

            // Convert to Eastern Time
            const easternTime = azostDateTime.setZone('America/New_York');

            // Format the date-time string as MM/DD/YYYY hh:mm.ssAM/PM
            const formattedEasternTime = easternTime.toFormat('M/dd/yyyy, h:mm:ss a');

            return formattedEasternTime;
        };

        const easternTime = convertToEasternTime(expirationTime);

        try {
            await api.profileOperation(auth.account_id, "theater0", "ModifyQuickbar", auth.access_token, {
                primaryQuickbarChoices: ["", "", ""],
                secondaryQuickbarChoice: ""
            });

            interaction.createMessage({
                embed: {
                    color: config.embedColors.success,
                    title: "Success!",
                    description: "You can now start duping!",
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                }, components: []
            }).catch(err => { return });

        } catch (err) {
            if (err.message.includes("profile is locked")) {
                console.log(err);
                interaction.createMessage({
                    embed: {
                        color: config.embedColors.error,
                        title: "Failed! Profile is locked!",
                        fields: [
                            {
                                name: `**Profile unlocks at ${easternTime} EST (Eastern Time)**`,
                                value: '',
                                inline: false
                            },
                            {
                                name: '**NOTE:** This time can randomly increase or if this command is spammed. Also, make sure you wait for the seconds.',
                                value: '',
                                inline: false
                            }
                        ],
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                        }
                    }, components: []
                }).catch(err => { return });
            } else {
                const error = JSON.parse(err.message)
                console.log(err);
                interaction.createMessage({
                    embed: {
                        title: ":x: Something went wrong! :x:",
                        description: `\`\`\`yml\n${error.errorMessage}\n\`\`\``,
                        color: config.embedColors.error,
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL,
                        }
                    }, components: []
                }).catch(err => { return });

            }
        }
    },
    info: {
        name: "dupe",
        description: "Does funny STW dupe! (Needs a glitched homebase)"
    },
    meta: {
        loginRequired: true,
        //loadoutPopup: false,
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    }
};