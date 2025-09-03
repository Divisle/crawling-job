export interface LeverJobInterface {
  id?: string | undefined;
  title: string;
  location: string;
  group?: string | undefined;
  department: string;
  workplaceType: string;
  employmentType?: string | null;
  href: string;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
}

export interface LeverApiPayload {
  additionalPlain: string;
  additional: string;
  categories: {
    commitment?: string | null;
    department: string;
    location: string;
    team: string;
    allLocations: string[];
  };
  createdAt: number;
  descriptionPlain: string;
  description: string;
  id: string;
  lists: {
    text: string;
    content: string;
  }[];
  text: string;
  country: string;
  workplaceType: string;
  opening: string;
  openingPlain: string;
  descriptionBody: string;
  descriptionBodyPlain: string;
  hostedUrl: string;
  applyUrl: string;
}

export function buildLeverJobMessage(
  data: {
    newJobs: LeverJobInterface[];
    updateJobs: LeverJobInterface[];
    deleteJobs: LeverJobInterface[];
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
          text: `*<${job.href}|${
            job.title
          }>*\n*Type*: ${job.workplaceType[0].toUpperCase()}${job.workplaceType.slice(
            1
          )}${
            job.employmentType ? " - " + job.employmentType : ""
          }\n*Department*: ${job.group ? job.group + " - " : ""}${
            job.department
          }`,
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
          text: `*<${job.href}|${
            job.title
          }>*\n*Type*: ${job.workplaceType[0].toUpperCase()}${job.workplaceType.slice(
            1
          )}${
            job.employmentType ? " - " + job.employmentType : ""
          }\n*Department*: ${job.group ? job.group + " - " : ""}${
            job.department
          }`,
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
          text: `*<${job.href}|${
            job.title
          }>*\n*Type*: ${job.workplaceType[0].toUpperCase()}${job.workplaceType.slice(
            1
          )}${
            job.employmentType ? " - " + job.employmentType : ""
          }\n*Department*: ${job.group ? job.group + " - " : ""}${
            job.department
          }`,
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
