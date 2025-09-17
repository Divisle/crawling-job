export interface JobMessageData {
  location: string;
  title: string;
  href: string;
  dateAdded?: string;
}

export function buildJobMessage(
  data: JobMessageData[],
  companyName: string,
  webUrl: string,
  channel: number
) {
  const blocks: any[] = [];
  if (data.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*--------------------------------------------------*\n*:rocket: ${
          channel === 1 ? "NEW JOBS POSTED" : "NEW LEAD JUST POSTED"
        } @ <${webUrl}|${companyName}> :rocket:*\n*--------------------------------------------------*`,
      },
    });
    data.forEach((job) => {
      blocks.push({
        type: "rich_text",
        elements: [
          {
            type: "rich_text_quote",
            elements: [
              {
                type: "text",
                text: "Job role: ",
                style: {
                  bold: true,
                },
              },
              {
                type: "link",
                url: job.href,
                text: job.title,
              },
              {
                type: "text",
                text:
                  "\n\tLocation: " +
                  job.location +
                  "\n\tDate added: " +
                  (job.dateAdded
                    ? job.dateAdded
                    : new Date().toLocaleDateString("en-GB")) +
                  "\n\tCompany Website: ",
              },
              {
                type: "link",
                url: webUrl,
                text: webUrl,
              },
            ],
          },
        ],
      });
    });
  }
  return blocks;
}
