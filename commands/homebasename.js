import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (_bot, interaction, args, api, config, loginData, _supabase) => {
        const auth = await safeDeviceAuthLogin(loginData);
        const name = args[0].value;

        await api.profileOperation(auth.account_id, "common_public", "SetHomebaseName", auth.access_token, {
            homebaseName: name
        });

        interaction.createMessage({ embed: {
            color: config.embedColors.success,
            title: "Homebase name changed!",
            description: `Successfully changed your homebase name to: ${name}`
        } }).catch(err => { return });
    },
    info: {
        name: "homebasename",
        description: "Changes your homebase name to whatever you wish.",
        options: [
            {
                "name": "name",
                "description": "The new name you want your homebase to have.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true
            }
        ]
    },
    meta: {
        loginRequired: true,
        loadoutPopup: false
    }
};
