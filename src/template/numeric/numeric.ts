export interface NumericJobInterface {
  id?: string;
  title: string;
  company: string;
  location_type: string;
  address: string;
  department: string;
  time: string;
  href: string;
  tags: string[];
}

export interface NumericJobTagInterface {
  id?: string;
  job_title: string;
  job_href: string;
  tag: string;
}

export function buildNumericJobMessage(data: {
  newJobs: NumericJobInterface[];
  updateJobs: NumericJobInterface[];
  deleteJobs: NumericJobInterface[];
}) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from *<https://www.numeric.io/|Numeric>*`,
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
          text:
            `*<${job.href}|${job.title}>*\n*Type*: ${job.location_type}\n*Company*: ${job.company}\n*Department*: ${job.department}\n*Time*: ${job.time}\n*Tags*:` +
            "`" +
            job.tags.join("`, `") +
            "`",
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
            text: job.address ? job.address : "No address provided",
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
          text:
            `*<${job.href}|${job.title}>*\n*Type*: ${job.location_type}\n*Company*: ${job.company}\n*Department*: ${job.department}\n*Time*: ${job.time}\n*Tags*:` +
            "`" +
            job.tags.join("`, `") +
            "`",
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
            text: job.address ? job.address : "No address provided",
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
          text:
            `*<${job.href}|${job.title}>*\n*Type*: ${job.location_type}\n*Company*: ${job.company}\n*Department*: ${job.department}\n*Time*: ${job.time}\n*Tags*:` +
            "`" +
            job.tags.join("`, `") +
            "`",
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
            text: job.address ? job.address : "No address provided",
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
