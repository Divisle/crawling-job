import { Prisma, PrismaClient } from "@prisma/client";
import { RedaccessJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class RedaccessJobHandler {
  constructor(private db = new RedaccessJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.RedaccessJobCreateInput[]> {
    try {
      const response: {
        data: {
          link: string;
          title: { rendered: string };
        }[];
      } = await axios.get("https://redaccess.io/wp-json/wp/v2/career");
      const data: Prisma.RedaccessJobCreateInput[] = response.data.map(
        (job) => {
          return {
            title: job.title.rendered,
            location: "Tel Aviv, Israel",
            href: job.link,
          };
        },
      );

      // console.log(`Scraped ${data.length} jobs from Redaccess`);
      // console.log(data);
      return data.filter((job) => job.title && job.location && job.href);
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.RedaccessJobCreateInput[],
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
      "Red Access",
      "https://redaccess.io/",
      1,
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new RedaccessJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// RedaccessJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
