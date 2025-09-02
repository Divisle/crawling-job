import { Prisma } from "@prisma/client";

export interface RecruitmentApiPayload {
  result: {
    status: number;
    page: string;
    data: {
      config: {
        dataset: {
          collectionName: string;
          sort: any[];
          collection: string;
          pageSize: number;
          lowercase: boolean;
          seoV2: boolean;
          filter: any;
        };
      };
      dynamicUrl: string;
      items: {
        location: {
          subdivisions: any[];
          city: string;
          location: any;
          countryFullname: string;
          streetAddress: {
            number: string;
            name: string;
            apt: string;
            formattedAddressLine: string;
          };
          formatted: string; // Location
          country: string;
          subdivision: string;
        };
        _id: string;
        _owner: string;
        jobDescription: string;
        _createdDate: any;
        "link-jobs-1-all": string;
        _updatedDate: any;
        salary: string; // salary range
        "link-jobs-1-title": string;
        jobId: string;
        requirements: any;
        publishedBy: string;
        aboutUs: any;
        title: string;
      }[];
      schemas: any;
      totalCount: number;
      userDefinedFilter: any;
    };
    message: string;
    redirectUrl: string;
  };
}

export interface RecruitmentTokenPayload {
  hs: any;
  visitorId: string;
  svSession: string;
  ctToken: string;
  mediaAuthToken: string;
  apps: any;
}

export function buildRecruitmentJobMessage(data: {
  newJobs: Prisma.RecruitmentJobCreateInput[];
  updateJobs: Prisma.RecruitmentJobCreateInput[];
  deleteJobs: Prisma.RecruitmentJobCreateInput[];
}) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from <https://www.recruitmentpeople.io/|Recruitment People>`,
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
          text: `*<${job.href}|${job.title}>*\n*Salary*: ${job.salary}`,
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
            text: `${job.location}`,
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
    data.newJobs.forEach((job) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${job.href}|${job.title}>*\n*Salary*: ${job.salary}`,
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
            text: `${job.location}`,
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
          text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from <https://seechange.com/|Seechanges>`,
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
            text: job.location,
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
