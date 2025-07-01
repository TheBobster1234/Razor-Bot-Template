import fs from "fs";
import { Constants } from "eris";

export default {
    exec: async (bot, interaction, _args, _api, config, _loginData, _supabase) => {
        
        const allowedUserId = config.ownerId.discordId;
        const channel = bot.getChannel("1098365865327607814");

        // Load note count from JSON file
        let noteCountData = JSON.parse(fs.readFileSync("./storage/noteCount.json"));
        let noteCount = noteCountData.count;

        if (interaction.member.id !== allowedUserId) {
            return interaction.createMessage({
                content: "You don't have permission to use this command.",
                flags: 64, // Makes the response ephemeral
            });
        }

        // Increment the note counter and prepare the note content
        noteCount++;
        const noteContent = interaction.data.options[0].value;

        console.log(noteContent);
        //const noteMessage = `**Note #${noteCount}:** ${noteContent}`;

        // Send the note to the specified channel
        try {
            await channel.createMessage({
                embed: {
                    color: config.embedColors.info,
                    title: `Note #${noteCount}:`,
                    description: `\`\`\`${noteContent}\`\`\``,
                    author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
                },
            });
            interaction.createMessage({
                embed: {
                    color: config.embedColors.success,
                    title: `Note #${noteCount}:`,
                    description: `Your note has been added!`,
                    author: { name: 'Razor Bot', icon_url: 'https://cdn.discordapp.com/avatars/706722341820039219/8fb243237e256cc3679ddeb2a423802e.webp?size=1280' }
                },
            }); // Acknowledge the interaction with an ephemeral message

            // Save the new count to JSON file
            fs.writeFileSync("./storage/noteCount.json", JSON.stringify({ count: noteCount }));
        } catch (error) {
            console.error("Failed to send note:", error);
            interaction.createMessage({
                content: "There was an error adding your note. Please try again later.",
                flags: 64,
            });
        }






        
    },
    info: {
        name: "note",
        description: "(Owner Only) Sends a note!",
        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [
            {
                name: 'message',
                description: 'The message for the note.',
                type: 3, // 3 is for STRING type in Discord's slash command options
                required: true
            }
        ]
    },
    meta: {
        loginRequired: false
        //loadoutPopup: false
    }
};