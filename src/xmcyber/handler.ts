import { Prisma, PrismaClient } from "@prisma/client";
import { XMCyberJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class XMCyberJobHandler {
  constructor(private db = new XMCyberJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.XMCyberJobCreateInput[]> {
    try {
      const response: {
        data: {
          name: string;
          location: {
            name: string;
          };
          url_active_page: string;
          url_detected_page: string;
          uid: string;
        }[];
      } = await axios.get(
        "https://www.comeet.co/careers-api/2.0/company/15.005/positions?token=51519692393A2A1454A2A145423930F3F"
      );
      const data: Prisma.XMCyberJobCreateInput[] = response.data.map((job) => ({
        title: job.name,
        location: job.location?.name || "No Location",
        href: job.url_detected_page
          ? job.url_detected_page
          : job.url_active_page,
      }));
      // console.log(`Scraped ${data.length} jobs from XMCyber`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.XMCyberJobCreateInput[]
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
    const blocks = buildJobMessage(data, "XM Cyber", "https://xmcyber.com/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new XMCyberJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// XMCyberJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
