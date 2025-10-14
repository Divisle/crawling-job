import { Prisma, PrismaClient } from "@prisma/client";
import { PenteraJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class PenteraJobHandler {
  constructor(private db = new PenteraJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.PenteraJobCreateInput[]> {
    try {
      const response: {
        data: {
          name: string;
          location: {
            name: string;
          };
          url_active_page: string;
        }[];
      } = await axios.get(
        "https://www.comeet.co/careers-api/2.0/company/C5.00D/positions?token=5CD1D013435289B343501D012E682E68289B"
      );
      const data: Prisma.PenteraJobCreateInput[] = response.data.map((job) => ({
        title: job.name,
        location: job.location?.name || "No Location",
        href: job.url_active_page,
      }));
      // console.log(`Scraped ${data.length} jobs from Pentera`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.PenteraJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Pentera", "https://pentera.io/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new PenteraJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// PenteraJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
