export interface DefaultJob {
  title: string;
  location: string;
  department?: string | null;
  href: string;
}

export interface DefaultJobMessageData {
  newJobs: DefaultJob[];
  deleteJobs: DefaultJob[];
  updateJobs: DefaultJob[];
}

export interface PortApiPayload {
  name: string;
  department: string;
  email: string;
  location: {
    name: string;
    country: string;
    city: string;
    state: string;
    postal_code: string;
    street_name: string;
    arrival_instructions: string | null;
    street_number: string;
    timezone: string;
    location_uid: string;
    is_remote: true;
  };
  url_comeet_hosted_page: string;
  url_recruit_hosted_page: string;
  url_active_page: string;
  employment_type: null;
  experience_level: null;
  uid: string;
  internal_use_custom_id: null;
  url_detected_page: null;
  picture_url: null;
  time_updated: string;
  company_name: string;
  is_internal: false;
  linkedin_job_posting_id: string;
  workplace_type: string;
  position_url: string;
}

export function buildDefaultJobMessage(
  data: DefaultJobMessageData,
  company: string,
  company_url: string
) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from <${company_url}|${company}>`,
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${
            job.department ? job.department : "No department provided"
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${
            job.department ? job.department : "No department provided"
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
          text: `*<${job.href}|${job.title}>*\n*Department*: ${
            job.department ? job.department : "No department provided"
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
