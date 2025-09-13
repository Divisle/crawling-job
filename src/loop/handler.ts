import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildGreenhouseDepartmentMessage,
  GreenhouseDepartmentApiPayLoad,
} from "../template";
import { buildMessage } from "../global";
import axios from "axios";
import { LoopRepository } from "./database";
export class LoopJobHandler {
  constructor(private db = new LoopRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.LoopJobCreateInput[]> {
    try {
      const jobData: Prisma.LoopJobCreateInput[] = [];
      const response: {
        data: GreenhouseDepartmentApiPayLoad;
      } = await axios.get(
        "https://boards-api.greenhouse.io/v1/boards/loop/departments"
      );
      for (const department of response.data.departments) {
        if (department.jobs.length === 0) continue;
        for (const job of department.jobs) {
          jobData.push({
            jobId: job.id.toString(),
            title: job.title,
            location: job.location.name,
            department: department.name,
            href: job.absolute_url,
          });
        }
      }
      return jobData;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(data: Prisma.LoopJobCreateInput[]) {
    const filteredData = await this.db.compareData(data);
    const listDeleteId = [
      ...filteredData.deleteJobs.map((job) => job.id as string),
      ...filteredData.updateJobs.map((job) => job.id as string),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...jobData } = job;
        return jobData;
      }),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(data: {
    newJobs: Prisma.LoopJobCreateInput[];
    updateJobs: Prisma.LoopJobCreateInput[];
    deleteJobs: Prisma.LoopJobCreateInput[];
  }) {
    const blocks = buildGreenhouseDepartmentMessage(
      data,
      "Loop",
      "https://www.loop.com/"
    );
    return { blocks, channel: 1 };
  }
  static async run() {
    const handler = new LoopJobHandler();
    const jobs = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobs);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
    // console.log("Scraped jobs:", jobs);
  }
}
