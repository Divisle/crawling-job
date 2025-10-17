import { Prisma, PrismaClient } from "@prisma/client";
import { SuperAIJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { buildMessage } from "../global";

export class SuperAIJobHandler {
  constructor(private db = new SuperAIJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.SuperAIJobCreateInput[]> {
    try {
      const response: {
        data: string;
      } = await axios.get("https://super-ai.jobs.personio.de/xml");
      // Parse the response data with xml format
      const result: {
        "workzag-jobs": {
          position: {
            id: string;
            office: string;
            name: string;
          }[];
        };
      } = JSON.parse(
        JSON.stringify(
          await parseStringPromise(response.data, {
            explicitArray: false,
            mergeAttrs: true,
          })
        )
      );
      const data: Prisma.SuperAIJobCreateInput[] = result[
        "workzag-jobs"
      ].position.map((job) => ({
        title: job.name,
        location: job.office,
        href: `https://super-ai.jobs.personio.de/job/${job.id}`,
      }));
      // console.log(`Scraped ${data.length} jobs from SuperAI`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.SuperAIJobCreateInput[]
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
    const blocks = buildJobMessage(data, "SuperAI", "https://super.ai/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new SuperAIJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// SuperAIJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
