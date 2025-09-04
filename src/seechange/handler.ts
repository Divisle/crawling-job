import { Prisma, PrismaClient } from "@prisma/client";
import { buildSeeChangeMessage, SeeChangeApiPayload } from "../template";
import { buildMessage } from "../global";
import axios from "axios";
import { SeeChangeRepository } from "./database";
export class SeeChangeJobHandler {
  constructor(private db = new SeeChangeRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.SeeChangeJobCreateInput[]> {
    try {
      const jobData: Prisma.SeeChangeJobCreateInput[] = [];
      const response: {
        data: SeeChangeApiPayload;
      } = await axios.get("https://seechange.bamboohr.com/careers/list");
      for (const job of response.data.result) {
        jobData.push({
          jobId: job.id,
          title: job.jobOpeningName,
          city: job.location.city,
          department: job.departmentLabel,
          employmentType: job.employmentStatusLabel,
          state: job.location.state,
          href: `https://seechange.com/careers/${job.id}`,
        });
      }
      return jobData;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(data: Prisma.SeeChangeJobCreateInput[]) {
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
    newJobs: Prisma.SeeChangeJobCreateInput[];
    updateJobs: Prisma.SeeChangeJobCreateInput[];
    deleteJobs: Prisma.SeeChangeJobCreateInput[];
  }) {
    const blocks = buildSeeChangeMessage(data);
    await buildMessage(1, blocks);
  }
  static async run() {
    const handler = new SeeChangeJobHandler();
    const jobs = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobs);
    await handler.sendMessage(filteredData);
  }
}
SeeChangeJobHandler.run();
