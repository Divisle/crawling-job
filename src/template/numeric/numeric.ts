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
  if (data.newJobs.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*--------------------------------------------------*\n*:rocket: NEW JOB(s) POSTED @ <http://google.com|Numeric> :rocket:*\n*--------------------------------------------------*",
      },
    });
    data.newJobs.forEach((job) => {
      blocks.push({
        type: "rich_text",
        elements: [
          {
            type: "rich_text_quote",
            elements: [
              {
                type: "text",
                text: "Job role: ",
                style: {
                  bold: true,
                },
              },
              {
                type: "link",
                url: job.href,
                text: job.title,
              },
              {
                type: "text",
                text:
                  "\n\tLocation: " +
                  job.address +
                  "\n\tDate added: " +
                  job.time +
                  "\n\tCompany Website: ",
              },
              {
                type: "link",
                url: "https://www.numeric.io/",
                text: "https://www.numeric.io/",
              },
            ],
          },
        ],
      });
    });
  }
  return blocks;
}
