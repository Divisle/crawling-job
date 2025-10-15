import { Prisma, PrismaClient } from "@prisma/client";
import { AleoJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class AleoJobHandler {
  constructor(private db = new AleoJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.AleoJobCreateInput[]> {
    try {
      const response: {
        data: {
          data: {
            allContentfulCareers: {
              edges: {
                node: {
                  availableRoles: {
                    title: string;
                    location: string;
                  }[];
                };
              }[];
            };
          };
        };
      } = await axios.get("https://aleo.org/page-data/sq/d/978757972.json");
      const data: Prisma.AleoJobCreateInput[] =
        response.data.data.allContentfulCareers.edges[0].node.availableRoles.map(
          (role) => ({
            title: role.title,
            location: role.location,
            href:
              "https://aleo.org/job/" +
              role.title.toLowerCase().replace(/ /g, "-"),
          })
        );
      // console.log(`Scraped ${data.length} jobs from Aleo`);
      // console.log(data);
      return data.filter((job) => job.title && job.location && job.href);
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.AleoJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Aleo", "https://aleo.org/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new AleoJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// AleoJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
