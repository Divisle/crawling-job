import { Prisma, PrismaClient } from "@prisma/client";
import { VelotixJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class VelotixJobHandler {
  constructor(private db = new VelotixJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.VelotixJobCreateInput[]> {
    try {
      const response: {
        data: {
          status: string;
          link: string;
          title: {
            rendered: string;
          };
        }[];
      } = await axios.get("https://www.velotix.ai/wp-json/wp/v2/careers");
      const data: Prisma.VelotixJobCreateInput[] = [];
      for (const job of response.data) {
        if (job.status !== "publish") {
          continue;
        }
        data.push({
          title: job.title.rendered,
          location: "No Location",
          href: job.link,
        });
      }
      // console.log(`Scraped ${data.length} jobs from Velotix`);
      // console.log(data);
      return data.filter((job) => job.title && job.location && job.href);
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.VelotixJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Velotix", "https://asimily.com/", 1);
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new VelotixJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// VelotixJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
