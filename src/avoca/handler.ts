import { Prisma, PrismaClient } from "@prisma/client";
import { AvocaJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class AvocaJobHandler {
  constructor(private db = new AvocaJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.AvocaJobCreateInput[]> {
    const payload = [
      {
        operationName: "JobBoardTheme",
        variables: {
          boardId: "avoca",
        },
        query:
          "query JobBoardTheme($boardId: String!) {\n  publicBrandingTheme(externalId: $boardId) {\n    id\n    theme\n    __typename\n  }\n}\n",
      },
      {
        operationName: "JobBoardList",
        variables: {
          boardId: "avoca",
        },
        query:
          "fragment ExternalJobPostFragment on PublicOatsJobPost {\n  id\n  title\n  descriptionHtml\n  extId\n  startDateTs\n  firstPublishedTsSec\n  companyLogo\n  companyUrl\n  isApplicationFormHidden\n  applicationFormTemplate {\n    id\n    includeEeoc\n    eeocConfig {\n      includeRaceXGender\n      includeVeteranStatus\n      includeDisabilityStatus\n      __typename\n    }\n    __typename\n  }\n  isUnlistedExternally\n  locations {\n    id\n    name\n    city\n    isoCountry\n    isRemote\n    extId\n    __typename\n  }\n  job {\n    id\n    locationType\n    employmentType\n    requisitionId\n    teamDisplayName\n    department {\n      id\n      name\n      extId\n      __typename\n    }\n    locations {\n      id\n      name\n      city\n      isoCountry\n      isRemote\n      extId\n      __typename\n    }\n    __typename\n  }\n  jobPostSectionHtml {\n    introHtml\n    outroHtml\n    __typename\n  }\n  compensationHtml\n  __typename\n}\n\nquery JobBoardList($boardId: String!) {\n  oatsExternalJobPostings(boardId: $boardId) {\n    jobPostings {\n      id\n      ...ExternalJobPostFragment\n      __typename\n    }\n    __typename\n  }\n  oatsExternalJobPostingsFilters(boardId: $boardId) {\n    type\n    displayName\n    rawValue\n    value\n    count\n    __typename\n  }\n  jobBoardExternal(vanityUrlPath: $boardId) {\n    id\n    teamDisplayName\n    descriptionHtml\n    pageTitle\n    __typename\n  }\n}\n",
      },
    ];

    try {
      const response: {
        data: {
          data: {
            oatsExternalJobPostings: {
              jobPostings: {
                title: string;
                extId: string;
                locations: {
                  name: string;
                }[];
              }[];
            };
          };
        }[];
      } = await axios.post(
        "https://jobs.gem.com/api/public/graphql/batch",
        payload
      );
      const data: Prisma.AvocaJobCreateInput[] =
        response.data[1].data.oatsExternalJobPostings.jobPostings.map(
          (posting) => ({
            title: posting.title,
            location: posting.locations[0]?.name || "No location",
            href: `https://jobs.gem.com/avoca/${posting.extId}`,
          })
        );
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.AvocaJobCreateInput[]
  ): Promise<JobMessageData[]> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => ({
        title: job.title,
        location: job.location,
        href: job.href,
      })),
    ];
    if (listDeleteId.length !== 0) {
      await this.db.deleteMany(listDeleteId);
    }
    if (listCreateData.length !== 0) {
      await this.db.createMany(listCreateData);
    }
    return filterData.newJobs.map((job) => ({
      location: job.location,
      title: job.title,
      href: job.href,
    }));
  }

  async sendMessage(data: JobMessageData[]) {
    const blocks = buildJobMessage(data, "Avoca", "https://www.avoca.ai/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new AvocaJobHandler();
    const data = await handler.scrapeJobs();
    // console.log(data);
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// AvocaJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
