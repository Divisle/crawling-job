import { Prisma, PrismaClient } from "@prisma/client";
import { HadriusJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class HadriusJobHandler {
  constructor(private db = new HadriusJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.HadriusJobCreateInput[]> {
    try {
      const response: {
        data: string;
      } = await axios.get("https://www.ycombinator.com/companies/hadrius/jobs");
      const responseParsed: {
        props: {
          jobPostings: {
            id: string;
            url: string;
            location: string;
            title: string;
          }[];
        };
      } = JSON.parse(
        response.data
          .split('data-page="')[1]
          .split('" data-reactroot="">')[0]
          .replaceAll("&quot;", '"')
      );
      const data: Prisma.HadriusJobCreateInput[] =
        responseParsed.props.jobPostings.map((posting) => {
          return {
            title: posting.title,
            location: posting.location || "Remote",
            href: `https://www.ycombinator.com${posting.url}`,
          };
        });
      // console.log(`Scraped ${data.length} jobs from Hadrius`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.HadriusJobCreateInput[]
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
      "Hadrius",
      "https://www.hadrius.com/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new HadriusJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// HadriusJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
