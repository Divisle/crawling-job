import { Prisma, PrismaClient } from "@prisma/client";
import { CerbyRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class CerbyJobHandler {
  constructor(private db = new CerbyRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.CerbyJobCreateInput[]> {
    try {
      const response: {
        data: {
          items: {
            name: string;
            locations: {
              name: string;
            }[];
            url: string;
          }[];
        };
      } = await axios.get("https://ats.rippling.com/api/v2/board/cerby/jobs");
      const data: Prisma.CerbyJobCreateInput[] = response.data.items.map(
        (item) => ({
          title: item.name,
          location: item.locations[0].name,
          href: item.url,
        })
      );
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.CerbyJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Cerby", "https://www.cerby.com/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new CerbyJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// CerbyJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
