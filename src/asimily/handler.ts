import { Prisma, PrismaClient } from "@prisma/client";
import { AsimilyJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class AsimilyJobHandler {
  constructor(private db = new AsimilyJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.AsimilyJobCreateInput[]> {
    try {
      const response: {
        data: {
          link: string;
          title: { rendered: string };
          _links: {
            "wp:term": {
              taxonomy: string;
              href: string;
            }[];
          };
        }[];
      } = await axios.get("https://asimily.com/wp-json/wp/v2/job");
      const data: Prisma.AsimilyJobCreateInput[] = await Promise.all(
        response.data.map(async (job) => {
          const locationTerm = job._links["wp:term"].find(
            (term) => term.taxonomy === "job-location"
          )?.href;
          if (!locationTerm) {
            return {
              title: job.title.rendered
                .replaceAll(/&#8211;/g, "-")
                .replaceAll(/&#8217;/g, "'")
                .trim(),
              location: "No location",
              href: job.link,
            };
          } else {
            const locationResponse: { data: { name: string }[] } =
              await axios.get(locationTerm);
            return {
              title: job.title.rendered
                .replaceAll(/&#8211;/g, "-")
                .replaceAll(/&#8217;/g, "'")
                .trim(),
              location: locationResponse.data.map((loc) => loc.name).join(", "),
              href: job.link,
            };
          }
        })
      );
      // console.log(`Scraped ${data.length} jobs from Asimily`);
      // console.log(data);
      return data.filter((job) => job.title && job.location && job.href);
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.AsimilyJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Asimily", "https://asimily.com/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new AsimilyJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// AsimilyJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
