import { Prisma, PrismaClient } from "@prisma/client";
import { CyfirmaJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class CyfirmaJobHandler {
  constructor(private db = new CyfirmaJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.CyfirmaJobCreateInput[]> {
    try {
      const response: {
        data: {
          title: {
            rendered: string;
          };
          link: string;
          content: {
            rendered: string;
          };
        }[];
      } = await axios.get("https://www.cyfirma.com/wp-json/wp/v2/jobs");
      const data: Prisma.CyfirmaJobCreateInput[] = response.data.map((job) => {
        let location = "N/A";
        if (job.content.rendered.split("Location").length >= 2) {
          location = job.content.rendered
            .split("Location")[1]
            .replaceAll(/\s*:\s*(<\/strong>)*\s*/gs, "")
            .replaceAll(/\s*<.*/gs, "");
        } else if (job.content.rendered.split("Country").length >= 2) {
          location = job.content.rendered
            .split("Country")[1]
            .replaceAll(/\s*:\s*(<\/strong>)*\s*/gs, "")
            .replaceAll(/\s*<.*/gs, "");
        }
        return {
          title: job.title.rendered
            .replace(/&#8211;/g, "-")
            .replace(/&#8217;/g, "'"),
          location,
          href: job.link,
        };
      });
      // console.log(`Scraped ${data.length} jobs from Cyfirma`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.CyfirmaJobCreateInput[]
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
      "Cyfirma",
      "https://www.cyfirma.com/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new CyfirmaJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

CyfirmaJobHandler.run().then((res) => {
  if (res.blocks.length > 0) {
    buildMessage(res.channel, res.blocks);
  }
});
