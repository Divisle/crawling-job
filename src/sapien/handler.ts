import { Prisma, PrismaClient } from "@prisma/client";
import { SapienJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class SapienJobHandler {
  constructor(private db = new SapienJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.SapienJobCreateInput[]> {
    try {
      const response: {
        data: string;
      } = await axios.get("https://sapien.ai/careers");
      const responseParsed: {
        title: string;
        location: string;
        href: string;
      }[] = response.data
        .split('<div class="paragraph-l cc-career cc-gradient-text-tertiary">')
        .slice(1)
        .map((block) =>
          JSON.parse(
            `{"title": "` +
              block
                .split(
                  '" target="_blank" class="career__cta-button-link w-inline-block"><div data-style="secondary'
                )[0]
                .replaceAll(
                  '</div></div></div><div class="career__type-wrapper"><div class="paragraph-l">Full-time</div></div><div class="career__button-wrapper"><a id="learn-more" href="',
                  '", "href": "'
                )
                .replaceAll(
                  '</div></div><div class="career__location-wrapper"><img src="https://cdn.prod.website-files.com/66a1373a3213eb7790291e2d/671a9a4c4229a7af01c92c8d_globe.svg" loading="lazy" alt=""/><div class="paragraph-l">',
                  '", "location": "'
                ) +
              '"}'
          )
        );
      const data: Prisma.SapienJobCreateInput[] = responseParsed.map(
        (posting) => {
          return {
            title: posting.title,
            location: posting.location || "Remote",
            href: posting.href,
          };
        }
      );
      // console.log(`Scraped ${data.length} jobs from Sapien`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.SapienJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Sapien", "https://www.sapien.ai/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new SapienJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// SapienJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
