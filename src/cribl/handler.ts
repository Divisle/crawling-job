import { Prisma, PrismaClient } from "@prisma/client";
import { CriblJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class CriblJobHandler {
  constructor(private db = new CriblJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.CriblJobCreateInput[]> {
    try {
      const response: {
        data: {
          jobs: {
            id: number;
            title: string;
            absolute_url: string;
            location: {
              name: string;
            };
          }[];
        };
      } = await axios.get(
        "https://boards-api.greenhouse.io/v1/boards/cribl/jobs"
      );
      const data: Prisma.CriblJobCreateInput[] = response.data.jobs.map(
        (job) => ({
          title: job.title,
          location: job.location.name || "No Location",
          href: `https://cribl.io/job-detail/${job.id}`,
        })
      );
      // console.log(`Scraped ${data.length} jobs from Cribl`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.CriblJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Cribl", "https://cribl.io/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new CriblJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// CriblJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
