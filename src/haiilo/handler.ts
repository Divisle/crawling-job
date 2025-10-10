import { Prisma, PrismaClient } from "@prisma/client";
import { HaiiloRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class HaiiloJobHandler {
  constructor(private db = new HaiiloRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.HaiiloJobCreateInput[]> {
    try {
      const response: {
        data: {
          jobs: {
            url: string;
            title: string;
            country: string;
            state: string;
            city: string;
          }[];
        };
      } = await axios.get(
        "https://apply.workable.com/api/v1/widget/accounts/haiilo-1?lng=en"
      );
      const data: Prisma.HaiiloJobCreateInput[] = response.data.jobs.map(
        (job) => ({
          title: job.title,
          location: job.city
            ? `${job.city}, ${job.state}`
            : job.country || "No location specified",
          href: job.url,
        })
      );
      console.log(`Scraped ${data.length} jobs from Haiilo`);
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.HaiiloJobCreateInput[]
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
      "Haiilo",
      "https://www.haiilo.com/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new HaiiloJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

HaiiloJobHandler.run().then(async (res) => {
  if (res.blocks.length > 0) {
    await buildMessage(res.channel, res.blocks);
  }
});
