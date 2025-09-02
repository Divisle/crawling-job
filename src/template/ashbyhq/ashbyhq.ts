import { Prisma } from "@prisma/client";

export interface AshbyhqApiPayload {
  jobs: [
    {
      id: string;
      title: string;
      department: string;
      team: string;
      employmentType: string;
      location: string;
      secondaryLocations: {
        locationId: string;
        locationName: string;
        __typename: string;
      }[];
      publishedAt: string;
      isListed: boolean;
      isRemote: boolean | null;
      address: any;
      jobUrl: string;
      applyUrl: string;
      descriptionHtml: string;
      descriptionPlain: string;
    }
  ];
}

export async function buildAshbyhqMessage(
  data: {
    newJobs: Prisma.LaurelJobCreateInput[];
    updateJobs: Prisma.WebaiJobUpdateInput[];
    deleteJobs: Prisma.WebaiJobCreateInput[];
  },
  web: string,
  webUrl: string
) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from *<${webUrl}|${web}>*`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${job.employmentType}*\n*Department*: ${job.department}`,
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
            text: `*Location:* ${job.location}`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${job.employmentType}*\n*Department*: ${job.department}`,
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
            text: `*Location:* ${job.location}`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${job.employmentType}*\n*Department*: ${job.department}`,
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
            text: `*Location:* ${job.location}`,
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
