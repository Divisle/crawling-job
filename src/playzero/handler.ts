import { Prisma, PrismaClient } from "@prisma/client";
import { PlayzeroJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class PlayzeroJobHandler {
  constructor(private db = new PlayzeroJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.PlayzeroJobCreateInput[]> {
    const payload = {
      clientType: "notion_app",
      source: {
        type: "collection",
        id: "6f83d90c-7bf1-4269-827e-2fe3e2faa34b",
        spaceId: "ef046b88-d744-47a0-9d7e-64bd3075054b",
      },
      collectionView: {
        id: "c8635ed5-42f0-48e8-ae47-5c1dd42ac47c",
        spaceId: "ef046b88-d744-47a0-9d7e-64bd3075054b",
      },
      loader: {
        reducers: {
          collection_group_results: {
            type: "results",
            limit: 50,
          },
        },
        filter: {
          operator: "and",
          filters: [
            {
              filter: {
                value: {
                  type: "exact",
                  value: "Open",
                },
                operator: "enum_is",
              },
              property: "RqfS",
            },
          ],
        },
        sort: [],
        searchQuery: "",
        userTimeZone: "Asia/Saigon",
      },
    };

    try {
      const response: {
        data: {
          recordMap: {
            block: {
              [key: string]: {
                value: {
                  properties?: {
                    title?: string[][];
                    "[XsR"?: string[][];
                    RqfS?: string[][];
                  };
                };
              };
            };
          };
        };
      } = await axios.post(
        "https://hq.playerzero.ai/api/v3/queryCollection?src=initial_load",
        payload
      );
      let data: Prisma.PlayzeroJobCreateInput[] = [];
      for (const key in response.data.recordMap.block) {
        const block = response.data.recordMap.block[key];
        if (
          !response.data.recordMap.block.hasOwnProperty(key) ||
          !block.value.properties ||
          !block.value.properties.RqfS ||
          !block.value.properties.title ||
          !block.value.properties["[XsR"] ||
          !(block.value.properties.RqfS[0][0] === "Open")
        ) {
          continue;
        }
        if (block.value.properties) {
          data.push({
            title: block.value.properties.title
              ? block.value.properties.title[0][0]
              : "No Title",
            location: block.value.properties["[XsR"]
              ? block.value.properties["[XsR"][0][0]
              : "No Location",
            href: `https://hq.playerzero.ai/${key.replaceAll("-", "")}`,
          });
        }
      }
      // console.log(`Scraped ${data.length} jobs from Playzero`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.PlayzeroJobCreateInput[]
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
      "Playrzero",
      "https://playerzero.ai/",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new PlayzeroJobHandler();
    const data = await handler.scrapeJobs();
    // console.log(data);
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// PlayzeroJobHandler.run().then(async (res) => {
//   if (res.blocks.length > 0) {
//     await buildMessage(res.channel, res.blocks);
//   }
// });
