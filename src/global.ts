import { WebClient } from "@slack/web-api";

// Define a global function
export async function buildMessage(channel: number, blocks: any[]) {
  const app = new WebClient(process.env.SLACK_BOT_TOKEN);
  if (!channel) {
    throw new Error("Channel ID is required");
  }
  if (!blocks || blocks.length === 0) {
    throw new Error("Message blocks are required");
  }
  if (channel !== 1 && channel !== 2) {
    throw new Error("Channel ID must be 1 or 2");
  }
  if (blocks.length > 50) {
    let chunkedBlocks: any[] = [];
    for (let i = 0; i < blocks.length; i += 50) {
      chunkedBlocks.push(blocks.slice(i, i + 50));
    }
    for (const chunk of chunkedBlocks) {
      await app.chat.postMessage({
        text: "",
        channel:
          channel == 1
            ? process.env.SLACK_FIRST_CHANNEL_ID!
            : process.env.SLACK_SECOND_CHANNEL_ID!,
        blocks: chunk,
        unfurl_links: false,
      });
    }
    return;
  }
  await app.chat.postMessage({
    text: "",
    channel:
      channel == 1
        ? process.env.SLACK_FIRST_CHANNEL_ID!
        : process.env.SLACK_SECOND_CHANNEL_ID!,
    blocks,
    unfurl_links: false,
  });
}
globalThis.buildMessage = buildMessage;
