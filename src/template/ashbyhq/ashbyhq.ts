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
      compensation?: null | {
        compensationTierSummary?: string | null;
        scrapeableCompensationSalarySummary?: string | null;
        compensationTiers: any[];
        summaryComponents: any[];
      };
    }
  ];
}

export interface AshbyhqInterface {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  href: string;
  compensation?: string | null;
}

export async function buildAshbyhqMessage(
  data: {
    newJobs: AshbyhqInterface[];
    updateJobs: AshbyhqInterface[];
    deleteJobs: AshbyhqInterface[];
  },
  channel: number,
  web: string,
  webUrl: string
) {
  const blocks: any[] = [];
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        `*--------------------------------------------------*\n*:rocket:` +
        (channel === 1 ? "NEW JOB(s) POSTED" : "") +
        `@ <${webUrl}|${web}> :rocket:*\n*--------------------------------------------------*`,
    },
  });
  if (data.newJobs.length > 0) {
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
    });
  }
  return blocks;
}
