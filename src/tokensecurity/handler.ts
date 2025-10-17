import { Prisma, PrismaClient } from "@prisma/client";
import { TokenSecurityJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class TokenSecurityJobHandler {
  constructor(private db = new TokenSecurityJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.TokenSecurityJobCreateInput[]> {
    const payload = {
      page: 0,
      filters: {
        "organization.id": [270380],
        page: 0,
      },
      query: "",
    };
    try {
      const response: {
        data: {
          results: {
            jobs: {
              url: string;
              title: string;
              locations: string[];
            }[];
          };
        };
      } = await axios.post(
        "https://api.getro.com/api/v2/collections/190/search/jobs",
        payload,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data: Prisma.TokenSecurityJobCreateInput[] =
        response.data.results.jobs.map((job) => ({
          title: job.title,
          location: job.locations.join(", "),
          href: job.url,
        }));
      // console.log(`Scraped ${data.length} jobs from TokenSecurity`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.TokenSecurityJobCreateInput[]
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
    const blocks = buildJobMessage(
      data,
      "Token Security",
      "https://www.token.security/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new TokenSecurityJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// TokenSecurityJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
