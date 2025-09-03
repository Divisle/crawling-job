import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildGreenhouseDepartmentMessage,
  GreenhouseDepartmentApiPayLoad,
} from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import { RelyanceJobRepository } from "./database";
export class RelyanceJobHandler {
  private app: WebClient;
  constructor(private db = new RelyanceJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
    this.app = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  async scrapeJobs(): Promise<Prisma.RelyanceJobCreateInput[]> {
    try {
      const jobData: Prisma.RelyanceJobCreateInput[] = [];
      const response: {
        data: GreenhouseDepartmentApiPayLoad;
      } = await axios.get(
        "https://boards-api.greenhouse.io/v1/boards/relyance/departments"
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

  async filterData(data: Prisma.RelyanceJobCreateInput[]) {
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
    newJobs: Prisma.RelyanceJobCreateInput[];
    updateJobs: Prisma.RelyanceJobCreateInput[];
    deleteJobs: Prisma.RelyanceJobCreateInput[];
  }) {
    const blocks = buildGreenhouseDepartmentMessage(
      data,
      "Relyance",
      "https://www.relyance.ai/"
    );
    await this.app.chat.postMessage({
      channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      // channel: process.env.SLACK_TEST_CHANNEL_ID!,
      blocks,
    });
  }
  static async run() {
    const handler = new RelyanceJobHandler();
    const jobs = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobs);
    await handler.sendMessage(filteredData);
    // console.log("Scraped jobs:", jobs);
  }
}
RelyanceJobHandler.run();
