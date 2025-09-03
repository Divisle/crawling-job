import { Prisma } from "@prisma/client";

export interface GreenhouseDepartmentApiPayLoad {
  departments: {
    id: string;
    name: string;
    parent_id: string | null;
    child_ids: any[];
    jobs: {
      absolute_url: string;
      data_compliance: {
        type: string;
        requires_consent: boolean;
        requires_processing_consent: boolean;
        requires_retention_consent: boolean;
        retention_period: null;
        demographic_data_consent_applies: boolean;
      }[];
      internal_job_id: number;
      location: {
        name: string;
      };
      metadata: null;
      id: number;
      updated_at: string;
      requisition_id: string;
      title: string;
      company_name: string;
      first_published: string;
    }[];
  }[];
}

export function buildGreenhouseDepartmentMessage(
  data: {
    newJobs: Prisma.LoopJobCreateInput[];
    updateJobs: Prisma.LoopJobCreateInput[];
    deleteJobs: Prisma.LoopJobCreateInput[];
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
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from <${webUrl}|${web}>`,
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}`,
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
            text: job.location ? job.location : "No location provided",
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}`,
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
            text: job.location ? job.location : "No location provided",
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${job.department}`,
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
            text: job.location ? job.location : "No location provided",
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
