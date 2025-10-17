import { Prisma, PrismaClient } from "@prisma/client";
import { SecuritiJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class SecuritiJobHandler {
  constructor(private db = new SecuritiJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.SecuritiJobCreateInput[]> {
    try {
      const response: {
        data: {
          jobs: {
            branch_id: number;
            title: string;
            url: string;
          }[];
          branches: {
            id: number;
            location: string;
          }[];
        };
      } = await axios.get(
        "https://securiti.freshteam.com/hire/widgets/jobs.json"
      );
      const data: Prisma.SecuritiJobCreateInput[] = response.data.jobs.map(
        (job) => ({
          title: job.title,
          location:
            response.data.branches.find((branch) => branch.id === job.branch_id)
              ?.location || "No location",
          href: job.url.replaceAll("/about/", "/careers/"),
        })
      );
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.SecuritiJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Securiti", "https://securiti.ai/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new SecuritiJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// SecuritiJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
