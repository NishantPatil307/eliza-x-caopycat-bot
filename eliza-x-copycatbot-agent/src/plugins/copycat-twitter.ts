import { 
    Plugin, 
    elizaLogger, 
    Action,
    ActionExample,
    Content
} from "@elizaos/core";

const copycatAction = {
    name: "COPYCAT_REPLY",
    similes: ["COPY_REPLY", "MIRROR_REPLY", "ECHO_REPLY"],
    description: "Replies with the exact same message received in Twitter mentions, minus the bot mention",
    
    validate: async (runtime, message) => {
        elizaLogger.debug("Validating copycat action for message:", message.content.text);
        
        // Check if this is a Twitter message
        const isTwitter = message.roomId?.includes('twitter') || 
                         message.content.source === 'twitter' ||
                         message.content.platform === 'twitter';
        
        // Check if the bot is mentioned
        const botUsername = runtime.character.username || runtime.character.name;
        const botMentioned = message.content.text?.includes(`@${botUsername}`) ||
                           message.content.text?.includes(`@${runtime.character.name}`);
        
        const shouldRespond = isTwitter && botMentioned;
        elizaLogger.debug(`Copycat validation - Twitter: ${isTwitter}, Mentioned: ${botMentioned}, Should respond: ${shouldRespond}`);
        
        return shouldRespond;
    },

    handler: async (runtime, message, state, options, callback) => {
        try {
            elizaLogger.log("Processing copycat action for message:", message.content.text);
            
            let originalText = message.content.text || "";
            const botUsername = runtime.character.username || runtime.character.name;
            
            // Remove bot mentions - be more thorough
            let replyText = originalText
                .replace(new RegExp(`@${botUsername}\\s*`, 'gi'), '')
                .replace(new RegExp(`@${runtime.character.name}\\s*`, 'gi'), '')
                .trim();
            
            // If no text remains after removing mentions, send a simple wave
            if (!replyText) {
                replyText = "👋";
            }

            elizaLogger.log(`Original: "${originalText}" -> Reply: "${replyText}"`);

            // Create the response content
            const response = {
                text: replyText,
                action: "COPYCAT_REPLY"
            };

            if (callback) {
                callback(response);
                return true;
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error in copycat action:", error);
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "@copycat_bot Hello there! How are you doing?" }
            },
            {
                user: "{{user2}}",
                content: { text: "Hello there! How are you doing?" }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "@copycat_bot Are you real? 🤖" }
            },
            {
                user: "{{user2}}",
                content: { text: "Are you real? 🤖" }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "@copycat_bot This is a test message!" }
            },
            {
                user: "{{user2}}",
                content: { text: "This is a test message!" }
            }
        ]
    ]
};

export const copycatTwitterPlugin = {
    name: "copycat-twitter",
    description: "A plugin that makes the bot copy exactly what users say when mentioned on Twitter",
    actions: [copycatAction],
    evaluators: [],
    providers: []
};