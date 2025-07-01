import { Constants } from "eris";

export default {
    exec: async (bot, interaction, _args, _api, config, _loginData, _supabase) => {

        // Check if user has the MANAGE_EMOJIS permission
        const member = interaction.member;
        const hasPermission = member.permissions.has('manageEmojisAndStickers');

        if (!hasPermission) {
            return interaction.createMessage({
                embed: {
                    color: config.embedColors.error,
                    title: "Failed!",
                    description: `You need the **"Manage Expressions"** permission to use this command.`,
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                },
                flags: 64 // Ephemeral flag - only visible to command user
            });
        }

        // Get the emoji input and name from options
        const emojiInput = interaction.data.options.find(opt => opt.name === 'emoji').value;
        let emojiName = interaction.data.options.find(opt => opt.name === 'name')?.value;

        // Defer reply since emoji upload might take time
        await interaction.defer();

        // Process different emoji input types
        let emojiURL;

        // Check if it's a custom Discord emoji
        const customEmojiRegex = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;
        const customEmojiMatch = emojiInput.match(customEmojiRegex);

        if (customEmojiMatch) {
            // It's a custom emoji
            const isAnimated = customEmojiMatch[1] === 'a';
            const emojiId = customEmojiMatch[3];

            if (!emojiName) {
                emojiName = customEmojiMatch[2]; // Use the emoji's original name if no name provided
            }

            emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
        } else if (emojiInput.startsWith('http')) {
            // It's a URL
            emojiURL = emojiInput;

            if (!emojiName) {
                // Generate a default name if none provided
                emojiName = 'custom_emoji_' + Date.now().toString().slice(-6);
            }
        } else {
            // It's possibly a Unicode emoji or invalid input
            return interaction.editOriginalMessage({
                embed: {
                    color: config.embedColors.error,
                    title: "Failed!",
                    description: "Please provide a valid custom emoji or image URL.",
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                },
            });
        }

        // Fetch the emoji data
        const response = await fetch(emojiURL);
        if (!response.ok) {
            return interaction.editOriginalMessage({
                embed: {
                    color: config.embedColors.error,
                    title: "Failed!",
                    description: "Failed to fetch the emoji. Make sure the URL is valid.",
                    author: {
                        name: bot.user.username,
                        icon_url: bot.user.avatarURL,
                    }
                },
            });
        }

        // Convert to buffer
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64Data = `data:image/${emojiURL.endsWith('.gif') ? 'gif' : 'png'};base64,${buffer.toString('base64')}`;

        // Create the emoji
        const createdEmoji = await bot.requestHandler.request("POST", `/guilds/${interaction.guildID}/emojis`, true, {
            name: emojiName,
            image: base64Data
        });

        // Send success message
        return interaction.editOriginalMessage({
            embed: {
                color: config.embedColors.success,
                title: "Success!",
                description: `Successfully added emoji: <${createdEmoji.animated ? 'a' : ''}:${createdEmoji.name}:${createdEmoji.id}>`,
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                }
            },
        });
    },
    info: {
        name: "addemoji",
        description: "Takes the emoji that you send and puts it into your own server!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [
            {
                name: 'emoji',
                description: 'The emoji to add (can be custom or URL)',
                type: 3, // STRING
                required: true
            },
            {
                name: 'name',
                description: 'Name for the emoji',
                type: 3, // STRING
                required: false
            }
        ]
    },
    meta: {
        loginRequired: false
        //loadoutPopup: false
    }
}
