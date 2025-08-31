import { Prisma } from "@prisma/client";

export interface SeeChangeApiPayload {
  meta: {
    totalCount: number;
  };
  result: {
    id: string;
    jobOpeningName: string;
    departmentId: string;
    departmentLabel: string;
    employmentStatusLabel: string;
    location: {
      city: string;
      state: string;
    };
    atsLocation: any;
    isRemote: any;
    locationType: any;
  }[];
}

export function buildSeeChangeMessage(data: {
  newJobs: Prisma.SeeChangeJobCreateInput[];
  updateJobs: Prisma.SeeChangeJobCreateInput[];
  deleteJobs: Prisma.SeeChangeJobCreateInput[];
}) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from <https://seechange.com/|Seechanges>`,
    },
  });
  if (
    data.newJobs.length === 0 &&
    data.updateJobs.length === 0 &&
    data.deleteJobs.length === 0
  ) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "No job updates found.",
      },
    });
  }
  if (data.newJobs.length > 0) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: "New Jobs",
        emoji: true,
      },
    });
    data.newJobs.forEach((job) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}\n*Employment Type*: ${job.employmentType}`,
        },
      });
      blocks.push({
        type: "context",
        elements: [
          {
            type: "image",
            image_url:
              "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
            alt_text: "Location",
          },
          {
            type: "mrkdwn",
            text: `${job.city ? job.city : "No city provided"}, ${
              job.state ? job.state : "No state provided"
            }`,
          },
        ],
      });
      blocks.push(divider);
    });
  }

  if (data.updateJobs.length > 0) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: "Updated Jobs",
        emoji: true,
      },
    });
    data.updateJobs.forEach((job) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}\n*Employment Type*: ${job.employmentType}`,
        },
      });
      blocks.push({
        type: "context",
        elements: [
          {
            type: "image",
            image_url:
              "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
            alt_text: "Location",
          },
          {
            type: "mrkdwn",
            text: `${job.city ? job.city : "No city provided"}, ${
              job.state ? job.state : "No state provided"
            }`,
          },
        ],
      });
      blocks.push(divider);
    });
  }

  if (data.deleteJobs.length > 0) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: "Deleted Jobs",
        emoji: true,
      },
    });
    data.deleteJobs.forEach((job) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}\n*Employment Type*: ${job.employmentType}`,
        },
      });
      blocks.push({
        type: "context",
        elements: [
          {
            type: "image",
            image_url:
              "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
            alt_text: "Location",
          },
          {
            type: "mrkdwn",
            text: `${job.city ? job.city : "No city provided"}, ${
              job.state ? job.state : "No state provided"
            }`,
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
