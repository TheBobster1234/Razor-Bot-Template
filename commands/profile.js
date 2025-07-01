import fs from "fs";
import { Constants } from "eris";
import { safeDeviceAuthLogin } from "../methods/safeDeviceAuthLogin.js";

export default {
    exec: async (_bot, interaction, args, api, config, loginData, _supabase) => {

            const auth = await safeDeviceAuthLogin(loginData);
            const profile = await api.profileOperation(auth.account_id, args[0].value, "QueryProfile", auth.access_token, {});
            const jsonString = JSON.stringify(profile, null, 2);

            // Write the JSON data to a file named "profile_athena.json"
            const fileName = `profile_${args[0].value}_${auth.account_id}.json`;
            fs.writeFileSync(`./storage/profile_${args[0].value}_${auth.account_id}.json`, jsonString, { encoding: 'utf-8' });
            //await fs.writeFileSync(fileName, JSON.stringify(profile, null, 2));

            await interaction.acknowledge();
            console.log(args[0].value);

            await await interaction.createFollowup({
                content: `Here is your requested ${args[0].value} profile:`,
                flags: 64,
                file: {
                    file: fs.readFileSync(`./storage/profile_${args[0].value}_${auth.account_id}.json`),
                    name: fileName
                }
            });

            await fs.unlinkSync(`./storage/profile_${args[0].value}_${auth.account_id}.json`);

    },
    info: {
        name: "profile",
        description: "Will send your selected profile file!",
        options: [
            {
                "name": "type",
                "description": "Which profile file would you like?",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "Athena", "value": "athena" },
                    { "name": "Campaign", "value": "campaign" },
                    { "name": "Theater0", "value": "theater0" },
                    { "name": "Theater1", "value": "theater1" },
                    { "name": "Theater2", "value": "theater2" }
                ]
            }
        ]
    },
    meta: {
        loginRequired: true
        //loadoutPopup: false
    }
};