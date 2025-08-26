import { Prisma } from "@prisma/client";

export interface CredoApiPayload {
  data: {
    jobBoard: {
      teams: [
        {
          id: string;
          name: string;
          parentTeamId: string;
        }
      ];
      jobPostings: [
        {
          id: string;
          title: string;
          teamId: string;
          locationId: string;
          locationName: string;
          workplaceType: string | null;
          employmentType: string;
          secondaryLocations: any[];
          compensationTierSummary: string | null;
        }
      ];
    };
  };
}

export async function buildCredoJobMessage(data: {
  newJobs: Prisma.CredoJobCreateInput[];
  updateJobs: Prisma.CredoJobUpdateInput[];
  deleteJobs: Prisma.CredoJobCreateInput[];
}) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from *<https://www.credo.ai/|Credo>*`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${
            job.workplaceType
              ? job.workplaceType + " - " + job.employmentType
              : job.employmentType
          }*\n*Department*: ${job.department}`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${
            job.workplaceType
              ? job.workplaceType + " - " + job.employmentType
              : job.employmentType
          }*\n*Department*: ${job.department}`,
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
          text: `*<${job.href}|${job.title}>*\n*Type: ${
            job.workplaceType
              ? job.workplaceType + " - " + job.employmentType
              : job.employmentType
          }*\n*Department*: ${job.department}`,
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
