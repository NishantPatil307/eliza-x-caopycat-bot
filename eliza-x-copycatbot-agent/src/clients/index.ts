import { AgentRuntime, Client, elizaLogger } from "@elizaos/core";

export async function initializeClients(
    character: any,
    runtime: AgentRuntime
): Promise<Client[]> {
    const clients: Client[] = [];
    const enabledClients = character.clients?.map((str: string) => str.toLowerCase().trim()) || [];

    if (enabledClients.includes("twitter")) {
        try {
            // Import Twitter client dynamically
            const { TwitterClientInterface } = await import("@elizaos/client-twitter");
            const twitterClient = await TwitterClientInterface.start(runtime);
            if (twitterClient) {
                clients.push(twitterClient as Client);
                elizaLogger.success("Twitter client successfully started for", character.name);
            }
        } catch (error) {
            elizaLogger.error("Failed to start Twitter client:", error);
            elizaLogger.error("Make sure to install: bun install @elizaos/client-twitter");
        }
    }

    if (clients.length === 0) {
        elizaLogger.warn("No clients were enabled for character", character.name);
    }

    return clients;
}