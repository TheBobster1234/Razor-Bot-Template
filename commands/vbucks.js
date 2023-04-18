import fs from "fs";
import { Constants } from "eris";
const offers = JSON.parse(fs.readFileSync("./assets/offers.json", "utf8"));

export default {
    exec: (_bot, interaction, _args, _api, config, _loginData, _supabase) => {
        const amount = interaction.data.options[0].value;

        interaction.createMessage({
            embed: {
                color: config.embedColors.info,
                title: "Successfully generated a purchase link!",
                description: `Generated a purchase link for ${offers[amount].amount} vbucks with cost $${offers[amount].price} USD. Click the link below to buy your vbucks!`
            },
            components: [
                {
                    type: Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Constants.ComponentTypes.BUTTON,
                            style: Constants.ButtonStyles.LINK,
                            label: "Click here to purchase your vbucks!",
                            url: `https://launcher-website.unrealengine.com/purchase?namespace=fn&offers=${offers[amount].id}&offerToken=c3RvbGVuX2Zyb209ZGlzdHJ1c3Qmam9pbl9zZXJ2ZXI9aHR0cHM6Ly9kaXNjb3JkLmdnL2pSWUg0YWpaUWEmc2xhdGVvbnRvcGJ0dw==&uePlatform=FNGame`,
                            disabled: false
                        }
                    ]
                }
            ]
        }).catch(err => { return });
    },
    info: {
        name: "vbucks",
        description: "Generates an epic games store url to purchase any increment of vbucks!",
        options: [
            {
                "name": "amount",
                "description": "The amount of v-bucks you want to purchase.",
                "type": Constants.ApplicationCommandOptionTypes.STRING,
                "required": true,
                "choices": [
                    { "name": "100 V-Bucks", "value": "100" },
                    { "name": "200 V-Bucks", "value": "200" },
                    { "name": "300 V-Bucks", "value": "300" },
                    { "name": "400 V-Bucks", "value": "400" },
                    { "name": "500 V-Bucks", "value": "500" },
                    { "name": "600 V-Bucks", "value": "600" },
                    { "name": "700 V-Bucks", "value": "700" },
                    { "name": "800 V-Bucks", "value": "800" },
                    { "name": "900 V-Bucks", "value": "900" },
                    { "name": "1000 V-Bucks", "value": "1000" },
                    { "name": "1100 V-Bucks", "value": "1100" },
                    { "name": "1200 V-Bucks", "value": "1200" },
                    { "name": "1300 V-Bucks", "value": "1300" },
                    { "name": "1400 V-Bucks", "value": "1400" },
                    { "name": "1500 V-Bucks", "value": "1500" },
                    { "name": "1600 V-Bucks", "value": "1600" },
                    { "name": "1700 V-Bucks", "value": "1700" },
                    { "name": "1800 V-Bucks", "value": "1800" },
                    { "name": "1900 V-Bucks", "value": "1900" },
                    { "name": "2000 V-Bucks", "value": "2000" },
                    { "name": "2800 V-Bucks", "value": "2800" },
                    { "name": "5000 V-Bucks", "value": "5000" },
                    { "name": "13500 V-Bucks", "value": "13500" }
                ]
            }
        ],
        type: Constants.ApplicationCommandTypes.CHAT_INPUT
    },
    meta: {
        loginRequired: false,
        loadoutPopup: false
    }
};