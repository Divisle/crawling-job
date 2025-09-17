import { Prisma, PrismaClient } from "@prisma/client";
import { IoJobRepository } from "./database";
import {
  buildAshbyhqMessage,
  AshbyhqApiPayload,
  IoApiPayload,
  buildJobMessage,
  JobMessageData,
} from "../template";
import { buildMessage } from "../global";
import axios from "axios";
export class IoJobHandler {
  constructor(private db = new IoJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.IoJobCreateInput[]> {
    try {
      const response: {
        data: IoApiPayload[];
      } = await axios.get("https://io.net/api/careers/jobs");
      const data: Prisma.IoJobCreateInput[] = response.data.map((job) => ({
        jobId: job.jobId,
        title: job.title,
        department: job.departmentName,
        location: job.locationName,
        employmentType: job.employmentType,
        href: job.applyLink,
      }));
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(jobData: Prisma.IoJobCreateInput[]): Promise<{
    newJobs: Prisma.IoJobCreateInput[];
    deleteJobs: Prisma.IoJobCreateInput[];
    updateJobs: Prisma.IoJobCreateInput[];
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
    newJobs: Prisma.IoJobCreateInput[];
    deleteJobs: Prisma.IoJobCreateInput[];
    updateJobs: Prisma.IoJobCreateInput[];
  }) {
    const jobDatas: JobMessageData[] = data.newJobs.map((job) => ({
      location: job.location,
      title: job.title,
      href: job.href,
    }));
    const blocks = buildJobMessage(jobDatas, "Io", "https://io.net/", 1);
    return { blocks, channel: 1 };
  }

  static async run() {
    const handler = new IoJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return handler.sendMessage(filteredData);
  }
}
