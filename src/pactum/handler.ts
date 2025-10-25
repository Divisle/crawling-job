import { Prisma, PrismaClient } from "@prisma/client";
import { PactumJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class PactumJobHandler {
  constructor(private db = new PactumJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.PactumJobCreateInput[]> {
    try {
      const response: {
        data: {
          data: {
            attributes: {
              "internal-name": string;
            };
            id: string;
            links: {
              "careersite-job-url": string;
            };
            relationships: {
              locations: {
                data: {
                  id: string;
                }[];
              };
              regions: {
                data: {
                  id: string;
                }[];
              };
            };
          }[];
          included: {
            id: string;
            attributes: {
              name: string;
            };
            type: "locations" | "regions";
          }[];
        };
      } = await axios.get(
        "https://api.teamtailor.com/v1/jobs?&api_key=T144Dnz4dCH8qypvyPZP4idGz954MGS4VLfWbb1b&api_version=20161108&include=locations,regions&fields[locations]=name,city&fields[regions]=name"
      );
      const data: Prisma.PactumJobCreateInput[] = response.data.data.map(
        (job) => {
          const locationIds = job.relationships.locations.data.map(
            (loc) => loc.id
          );
          const regionIds = job.relationships.regions.data.map((reg) => reg.id);
          const locationNames = response.data.included
            .filter(
              (inc) =>
                (inc.type === "locations" && locationIds.includes(inc.id)) ||
                (inc.type === "regions" && regionIds.includes(inc.id))
            )
            .map((inc) => inc.attributes.name);
          return {
            title: job.attributes["internal-name"],
            location: locationNames.join(", ") || "Remote",
            href: job.links["careersite-job-url"],
          };
        }
      );
      // console.log(`Scraped ${data.length} jobs from Pactum`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.PactumJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Pactum", "https://pactum.com/", 2);
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new PactumJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// PactumJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
