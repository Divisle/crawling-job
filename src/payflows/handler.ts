import { Prisma, PrismaClient } from "@prisma/client";
import { PayflowsJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class PayflowsJobHandler {
  constructor(private db = new PayflowsJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.PayflowsJobCreateInput[]> {
    try {
      const response: {
        data: string;
      } = await axios.get("https://payflows.recruitee.com/");
      const responseParsed: {
        appConfig: {
          offers: {
            locations: {
              translations: {
                [key: string]: {
                  city: string;
                  country: string;
                  name: string;
                  note: string;
                  postalCode: string;
                  state: string;
                  street: string;
                };
              };
            }[];
            translations: {
              [key: string]: {
                title: string;
              };
            };
            slug: string;
          }[];
        };
      } = JSON.parse(
        response.data
          .split('data-props="')[1]
          .split('"><div></div>')[0]
          .replaceAll("&quot;", '"')
      );
      const data: Prisma.PayflowsJobCreateInput[] =
        responseParsed.appConfig.offers.map((offer) => {
          const title = offer.translations["en"].title;
          const slug = offer.slug;
          const locationTranslation = offer.locations.map(
            (loc) => loc.translations["en"]
          );
          const location = locationTranslation
            .map((loc) => {
              const parts = [loc.city, loc.state, loc.country].filter(Boolean);
              return parts.join(", ");
            })
            .join(" | ");
          return {
            title,
            location: location || "Remote",
            href: `https://payflows.recruitee.com/o/${slug}`,
          };
        });
      // console.log(`Scraped ${data.length} jobs from Payflows`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.PayflowsJobCreateInput[]
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
      "Payflows",
      "https://www.payflows.io/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new PayflowsJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// PayflowsJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
