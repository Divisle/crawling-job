import { Prisma, PrismaClient } from "@prisma/client";
import { EnergyRoboticsJobRepository } from "./database";
import {
  AshbyhqPostApiPayload,
  JobMessageData,
  buildJobMessage,
} from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class EnergyRoboticsJobHandler {
  constructor(
    private db = new EnergyRoboticsJobRepository(new PrismaClient())
  ) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.EnergyRoboticsJobCreateInput[]> {
    try {
      const response: {
        data: {
          name: string;
          id: string;
          office: string;
        }[];
      } = await axios.get(
        "https://energy-robotics.jobs.personio.de/search.json"
      );
      const data: Prisma.EnergyRoboticsJobCreateInput[] = response.data.map(
        (posting) => ({
          title: posting.name,
          location: posting.office,
          href: `https://energy-robotics.jobs.personio.de/job/${posting.id}`,
        })
      );
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.EnergyRoboticsJobCreateInput[]
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
      "Energy Robotics",
      "https://www.energy-robotics.com/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new EnergyRoboticsJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

EnergyRoboticsJobHandler.run().then(async (res) => {
  if (res.blocks.length > 0) {
    await buildMessage(res.channel, res.blocks);
  }
});
