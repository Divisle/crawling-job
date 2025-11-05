import { Prisma, PrismaClient } from "@prisma/client";
import { GladiaJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class GladiaJobHandler {
  constructor(private db = new GladiaJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.GladiaJobCreateInput[]> {
    const payload = {
      meta: {
        size: 100,
      },
      board: {
        id: "gladia",
        isParent: false,
      },
      query: {
        promoteFeatured: true,
      },
      parentSlug: "xange",
    };
    try {
      const response: {
        data: {
          jobs: {
            title: string;
            url: string;
            locations: string[];
          }[];
        };
      } = await axios.post(
        "https://jobs.xange.vc/api-boards/search-jobs",
        payload
      );
      const data: Prisma.GladiaJobCreateInput[] = response.data.jobs.map(
        (job) => ({
          title: job.title,
          location:
            job.locations.length > 0 ? job.locations.join(", ") : "No Location",
          href: job.url,
        })
      );
      // console.log(`Scraped ${data.length} jobs from Gladia`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.GladiaJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Gladia", "https://www.gladia.io/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new GladiaJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// GladiaJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
