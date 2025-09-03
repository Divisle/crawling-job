import { Prisma, PrismaClient } from "@prisma/client";
import { SysdigJobRepository } from "./database";
import { buildLeverJobMessage, LeverApiPayload } from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";

export class SysdigJobHandler {
  private app: WebClient;
  constructor(private db = new SysdigJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.SysdigJobCreateInput[]> {
    const data: Prisma.SysdigJobCreateInput[] = [];
    const respond: {
      data: LeverApiPayload[];
    } = await axios.get(
      "https://api.lever.co/v0/postings/sysdig?mode=json&limit=100&skip=0"
    );
    for (const job of respond.data) {
      data.push({
        title: job.text,
        location: job.categories.location,
        department: job.categories.department,
        workplaceType: job.workplaceType,
        employmentType: job.categories.commitment
          ? job.categories.commitment
          : null,
        group: job.categories.team,
        href: job.hostedUrl,
      });
    }
    return data;
  }

  async filterData(data: Prisma.SysdigJobCreateInput[]) {
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
    newJobs: Prisma.SysdigJobCreateInput[];
    updateJobs: Prisma.SysdigJobCreateInput[];
    deleteJobs: Prisma.SysdigJobCreateInput[];
  }) {
    const blocks = buildLeverJobMessage(data, "Sysdig", "https://sysdig.com/");
    await this.app.chat.postMessage({
      // channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      channel: process.env.SLACK_TEST_CHANNEL_ID!,
      blocks,
    });
  }

  static async run() {
    const handler = new SysdigJobHandler();
    const jobData = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobData);
    await handler.sendMessage(filteredData);
  }
}

SysdigJobHandler.run();
