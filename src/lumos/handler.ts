import { Prisma, PrismaClient } from "@prisma/client";
import { LumosJobRepository } from "./database";
import { buildMessage } from "../global";
import { buildDefault1JobMessage, LumosApiPayload } from "../template";
import axios from "axios";
export class LumosJobScraper {
  constructor(private db = new LumosJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.LumosJobCreateInput[]> {
    const jobData: Prisma.LumosJobCreateInput[] = [];
    const respond: {
      data: LumosApiPayload;
    } = await axios.get(
      "https://boards-api.greenhouse.io/v1/boards/lumos/jobs"
    );
    respond.data.jobs.forEach((job) => {
      jobData.push({
        jobId: job.id.toString(),
        title: job.title,
        location: job.location.name,
        href: job.absolute_url,
      });
    });
    return jobData;
  }

  async filterData(jobData: Prisma.LumosJobCreateInput[]): Promise<{
    newJobs: Prisma.LumosJobCreateInput[];
    deleteJobs: Prisma.LumosJobCreateInput[];
    updateJobs: Prisma.LumosJobCreateInput[];
  }> {
    const filteredData = await this.db.compareData(jobData);
    const listDeletedIds = [
      ...filteredData.deleteJobs.map((job) => job.id!),
      ...filteredData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...rest } = job;
        return {
          ...rest,
        };
      }),
    ];
    await this.db.deleteMany(listDeletedIds);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(messageData: {
    newJobs: Prisma.LumosJobCreateInput[];
    deleteJobs: Prisma.LumosJobCreateInput[];
    updateJobs: Prisma.LumosJobCreateInput[];
  }) {
    const blocks = await buildDefault1JobMessage(
      messageData,
      "Lumos",
      "https://www.lumos.ai"
    );
    try {
      buildMessage(1, blocks);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  static async run() {
    const scraper = new LumosJobScraper();
    const data = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(data);
    await scraper.sendMessage(filteredData);
  }
}

LumosJobScraper.run();
