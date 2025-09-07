import { Prisma, PrismaClient } from "@prisma/client";
import { LaurelRepository } from "./database";
import { buildAshbyhqMessage, AshbyhqApiPayload } from "../template";
import { buildMessage } from "../global";
import axios from "axios";
export class LaurelJobHandler {
  constructor(private db = new LaurelRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.LaurelJobCreateInput[]> {
    try {
      const response: {
        data: AshbyhqApiPayload;
      } = await axios.get(
        "https://api.ashbyhq.com/posting-api/job-board/Laurel"
      );
      const data: Prisma.LaurelJobCreateInput[] = response.data.jobs.map(
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

  async filterData(jobData: Prisma.LaurelJobCreateInput[]): Promise<{
    newJobs: Prisma.LaurelJobCreateInput[];
    deleteJobs: Prisma.LaurelJobCreateInput[];
    updateJobs: Prisma.LaurelJobCreateInput[];
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
    newJobs: Prisma.LaurelJobCreateInput[];
    deleteJobs: Prisma.LaurelJobCreateInput[];
    updateJobs: Prisma.LaurelJobCreateInput[];
  }) {
    const blocks = await buildAshbyhqMessage(
      data,
      "Laurel",
      "https://www.laurel.ai/"
    );
    try {
      await buildMessage(1, blocks);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  static async run() {
    const handler = new LaurelJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return;
    }
    await handler.sendMessage(filteredData);
  }
}
