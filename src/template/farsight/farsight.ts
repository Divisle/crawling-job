export interface FarSightApiPayload {
  id: string | null;
  jobs: {
    id: string;
    title: string;
    locations: {
      location_type: string;
      location_option: {
        id: string;
        display_name: string;
        location_type: string;
        city: string;
        state: string;
        country: string;
      };
      name: string;
    }[];
    is_published: boolean;
    is_sample: boolean;
  }[];
  name: string;
}
[];

export interface FarSightJobInterface {
  id?: string;
  jobId: string;
  title: string;
  href: string;
  locations: {
    locationId: string;
    locationType: string;
    locationName: string;
  }[];
}

export function buildFarSightJobsMessage(data: {
  newJobs: FarSightJobInterface[];
  updateJobs: FarSightJobInterface[];
  deleteJobs: FarSightJobInterface[];
}) {
  const blocks: any[] = [];
  const divider = {
    type: "divider",
  };
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `We found *${data.newJobs.length} new jobs*, *${data.updateJobs.length} updated jobs* and *${data.deleteJobs.length} jobs removed* from *<https://farsight-ai.com/|Farsight AI>*`,
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
          text: `*<${job.href}|${job.title}>*`,
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
            text: `*Location:* ${
              job.locations.length > 0
                ? job.locations.length === 1
                  ? job.locations[0].locationType
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()) +
                    " (" +
                    job.locations[0].locationName +
                    ")"
                  : job.locations
                      .map(
                        (loc) =>
                          loc.locationType
                            .toLowerCase()
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()) +
                          " (" +
                          loc.locationName +
                          ")"
                      )
                      .join(" | ")
                : "No Location"
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
          text: `*<${job.href}|${job.title}>*`,
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
            text: `*Location:* ${
              job.locations.length > 0
                ? job.locations.length === 1
                  ? job.locations[0].locationType
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()) +
                    " (" +
                    job.locations[0].locationName +
                    ")"
                  : job.locations
                      .map(
                        (loc) =>
                          loc.locationType
                            .toLowerCase()
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()) +
                          " (" +
                          loc.locationName +
                          ")"
                      )
                      .join(" | ")
                : "No Location"
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
          text: `*<${job.href}|${job.title}>*`,
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
            text: `*Location:* ${
              job.locations.length > 0
                ? job.locations.length === 1
                  ? job.locations[0].locationType
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()) +
                    " (" +
                    job.locations[0].locationName +
                    ")"
                  : job.locations
                      .map(
                        (loc) =>
                          loc.locationType
                            .toLowerCase()
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()) +
                          " (" +
                          loc.locationName +
                          ")"
                      )
                      .join(" | ")
                : "No Location"
            }`,
          },
        ],
      });
      blocks.push(divider);
    });
  }
  return blocks;
}
