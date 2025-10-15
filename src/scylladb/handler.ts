import { Prisma, PrismaClient } from "@prisma/client";
import { ScylladbJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class ScylladbJobHandler {
  constructor(private db = new ScylladbJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.ScylladbJobCreateInput[]> {
    try {
      const response: {
        data: {
          name: string;
          location: {
            name: string;
          };
          url_active_page: string;
          uid: string;
        }[];
      } = await axios.get(
        "https://www.comeet.co/careers-api/2.0/company/E4.006/positions?token=4E6187E1D64224A0013984E60187E"
      );
      const data: Prisma.ScylladbJobCreateInput[] = response.data.map(
        (job) => ({
          title: job.name,
          location: job.location?.name || "No Location",
          href:
            "https://www.scylladb.com/company/careers/job-openings/co/" +
            job.location.name
              .replaceAll(" ", "-")
              .replaceAll("(", "")
              .replaceAll(")", "")
              .toLowerCase() +
            "/" +
            job.uid +
            "/" +
            job.url_active_page
              .replaceAll("https://www.comeet.com/jobs/scylladb/E4.006/", "")
              .replaceAll(job.uid, "") +
            "/all",
        })
      );
      // console.log(`Scraped ${data.length} jobs from ScyllaDB`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.ScylladbJobCreateInput[]
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
      "ScyllaDB",
      "https://www.scylladb.com/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new ScylladbJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

ScylladbJobHandler.run().then(async (res) => {
  if (res.blocks.length > 0) {
    await buildMessage(res.channel, res.blocks);
  }
});
