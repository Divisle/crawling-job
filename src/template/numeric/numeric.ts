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
      type: "header",
      text: {
        type: "plain_text",
        text: "--------------------------------------------------\n:rocket: NEW JOB POSTED @ Numeric :rocket:\n--------------------------------------------------",
        emoji: true,
      },
    });
    data.newJobs.forEach((job) => {
      const listTags: any[] = [];
      job.tags.forEach((tag) => {
        listTags.push({
          type: "text",
          text: tag,
          style: {
            code: true,
          },
        });
        listTags.push({
          type: "text",
          text: ", ",
        });
      });
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
                  "\n\tType: " +
                  job.location_type +
                  "\n\tCompany: " +
                  job.company +
                  "\n\tDepartment: " +
                  job.department +
                  "\n\tDate added: " +
                  job.time +
                  "\n\tTags:  ",
              },
              ...listTags.slice(0, -1), // Remove last comma
            ],
          },
        ],
      });
    });
  }
  return blocks;
}
