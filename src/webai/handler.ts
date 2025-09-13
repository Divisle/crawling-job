import { Prisma, PrismaClient } from "@prisma/client";
import { WebaiRepository } from "./database";
import { buildAshbyhqMessage, AshbyhqApiPayload } from "../template";
import { buildMessage } from "../global";
import axios from "axios";
export class WebaiJobHandler {
  constructor(private db = new WebaiRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.WebaiJobCreateInput[]> {
    try {
      const response: {
        data: AshbyhqApiPayload;
      } = await axios.get(
        "https://api.ashbyhq.com/posting-api/job-board/Webai"
      );
      const data: Prisma.WebaiJobCreateInput[] = response.data.jobs.map(
        (job) => ({
          jobId: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          href: job.jobUrl,
        })
      );
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(jobData: Prisma.WebaiJobCreateInput[]): Promise<{
    newJobs: Prisma.WebaiJobCreateInput[];
    deleteJobs: Prisma.WebaiJobCreateInput[];
    updateJobs: Prisma.WebaiJobCreateInput[];
  }> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => ({
        ...job,
        id: undefined,
      })),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listCreateData);
    return filterData;
  }

  async sendMessage(data: {
    newJobs: Prisma.WebaiJobCreateInput[];
    deleteJobs: Prisma.WebaiJobCreateInput[];
    updateJobs: Prisma.WebaiJobCreateInput[];
  }) {
    const blocks = await buildAshbyhqMessage(data, "Webai", "http://webai.com");
    return { blocks, channel: 2 };
  }

  static async run() {
    const handler = new WebaiJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return {
        blocks: [] as any[],
        channel: 0,
      };
    }
    return await handler.sendMessage(filteredData);
  }
}
