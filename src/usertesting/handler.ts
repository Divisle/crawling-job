import { Prisma, PrismaClient } from "@prisma/client";
import { UserTestingJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class UserTestingJobHandler {
  constructor(private db = new UserTestingJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.UserTestingJobCreateInput[]> {
    try {
      const payload = {
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: "",
      };
      const response: {
        data: {
          jobPostings: {
            title: string;
            locationsText: string;
            externalPath: string;
          }[];
        };
      } = await axios.post(
        "https://usertesting.wd12.myworkdayjobs.com/wday/cxs/usertesting/UserTesting/jobs",
        payload
      );
      const data: Prisma.UserTestingJobCreateInput[] =
        response.data.jobPostings.map((job) => ({
          title: job.title,
          location: job.locationsText || "No Location",
          href:
            "https://usertesting.wd12.myworkdayjobs.com/en-US/UserTesting" +
            job.externalPath,
        }));
      console.log(`Scraped ${data.length} jobs from UserTesting`);
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.UserTestingJobCreateInput[]
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
      "UserTesting",
      "https://www.usertesting.com/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new UserTestingJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// UserTestingJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
