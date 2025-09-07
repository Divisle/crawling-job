import { Prisma, PrismaClient } from "@prisma/client";
import { PortJobRepository } from "./database";
import {
  buildDefaultJobMessage,
  DefaultJobMessageData,
  PortApiPayload,
} from "../template";
import { buildMessage } from "../global";
import axios from "axios";

export class PortJobScraper {
  constructor(private db = new PortJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.PortJobCreateInput[]> {
    const jobData: Prisma.PortJobCreateInput[] = [];
    const response: {
      data: PortApiPayload[];
    } = await axios.get(
      "https://www.comeet.co/careers-api/2.0/company/59.004/positions?token=954414C02550414C4AA01BFC12A81BFC2550"
    );
    response.data.forEach((item) => {
      jobData.push({
        title: item.name,
        location: item.location.name,
        department: item.department,
        href: item.url_active_page,
      });
    });
    return jobData;
  }

  async filterData(
    jobData: Prisma.PortJobCreateInput[]
  ): Promise<DefaultJobMessageData> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listNewData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => {
        const { id, ...rest } = job;
        return rest;
      }),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listNewData);

    const messageData = {
      newJobs: filterData.newJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
      deleteJobs: filterData.deleteJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
      updateJobs: filterData.updateJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
    };
    return messageData;
  }

  async sendMessage(data: DefaultJobMessageData) {
    const blocks = buildDefaultJobMessage(data, "Port", "https://www.port.io");
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new PortJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return;
    }
    await scraper.sendMessage(filteredData);
  }
}
