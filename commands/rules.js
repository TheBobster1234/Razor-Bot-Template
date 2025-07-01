import fs from "fs";
import { Constants } from "eris";

export default {
    exec: (bot, interaction, _args, _api, config, _loginData, _supabase) => {

                const member = interaction.member;
    
                // Check if the user has the Administrator permission
                if (!member.permission.has('administrator')) {
                    return interaction.createMessage({
                        content: 'You do not have the necessary permissions to use this command.',
                        flags: 64 // This flag makes the message ephemeral (only visible to the user who triggered it)
                    });
                }
    
                const channelID = interaction.data.options[0].value;
                const channel = bot.getChannel(channelID);
    
                if (!channel || !channel.permissionsOf(bot.user.id).has('sendMessages')) {
                    return interaction.createMessage('I do not have permission to send messages in that channel.');
                }
    
                try {
                     channel.createMessage({
                        embed: {
                            color: config.embedColors.info,
                            title: "Rules:",
                            description: 
                            `**1. Be Respectful:**\n・Treat everyone with respect. Harassment, discrimination, or hate speech will not be tolerated.
                            \n**2. No Spamming:**\n・Avoid spamming messages, images, or emojis. Keep conversations clear and meaningful.
                            \n**3. No NSFW Content:**\n・Do not post or share any NSFW (Not Safe For Work) content. This includes images, videos, and links.
                            \n**4. Stay On Topic:**\n・Keep discussions relevant to the channel topic. Use the appropriate channels for specific discussions.
                            \n**5. No Self-Promotion:**\n・Do not advertise or promote your own content without permission from the admins.
                            \n**6. Use Appropriate Channels:**\n・Post in the correct channels. Off-topic conversations should be moved to the appropriate sections.
                            \n**7. No Impersonation:**\n・Do not impersonate other members, staff, or public figures.
                            \n**8. No Sharing Personal Information:**\n・Protect your privacy and others. Do not share personal information such as addresses, phone numbers, or passwords.
                            \n**9. Listen to Moderators:**\n・Respect the moderators and their decisions. If you disagree, discuss it calmly and respectfully.
                            \n**10. Follow Discord's Terms of Service:**\n・Adhere to [Discord’s Terms of Service](<https://discord.com/tos>) and [Community Guidelines](<https://discord.com/guidelines>).`,
                            author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
                        },
                    });

                    interaction.createMessage({
                        embed: {
                            color: config.embedColors.info,
                            title: "Rules have been sent to the specified channel!",
                            author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
                        },
                    });


                } catch (err) {
                    console.error('Failed to send rules:', err);
                     interaction.createMessage('Failed to send the rules. Please try again.');
                }







        
    },
    info: {
        name: "rules",
        description: "Sends simple server rules to a specified channel!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [
            {
                name: 'channel',
                description: 'The channel to send the rules to',
                type: 7, // Channel type
                required: true
            }
        ]
    },
    meta: {
        loginRequired: false
        //loadoutPopup: false
    }
};