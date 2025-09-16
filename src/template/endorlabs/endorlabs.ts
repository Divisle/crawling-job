import { DefaultJobMessageData } from "../default";

export function buildEndorLabsMessage(data: DefaultJobMessageData) {
  const blocks: any[] = [];
  if (data.newJobs.length > 0) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: "--------------------------------------------------\n:rocket: NEW JOB POSTED @ Numeric :rocket:\n--------------------------------------------------",
        emoji: true,
      },
    });
    data.newJobs.forEach((job) => {
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
                text: `\n\tLocation: ${
                  job.location ? job.location : "No location provided"
                }\n\tDepartment: ${
                  job.department ? job.department : "No department provided"
                }`,
              },
            ],
          },
        ],
      });
    });
  }

  return blocks;
}
