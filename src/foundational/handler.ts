import { Prisma, PrismaClient } from "@prisma/client";
import { FoundationalJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class FoundationalJobHandler {
  constructor(private db = new FoundationalJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.FoundationalJobCreateInput[]> {
    const payload = {
      source: {
        type: "collection",
        id: "2c6260d1-fd40-40a6-ae35-bd1360cae0c6",
        spaceId: "99193164-47cc-4204-9493-69983ea65907",
      },
      collectionView: {
        id: "225ee9a7-49db-4c66-a91b-01f7119ef614",
        spaceId: "99193164-47cc-4204-9493-69983ea65907",
      },
      loader: {
        reducers: {
          collection_group_results: {
            type: "results",
            limit: 50,
          },
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
                  id: string;
                  properties: {
                    title: string[][];
                    "zs>i": string[][];
                  };
                };
              };
            };
          };
        };
      } = await axios.post(
        "https://foundational-data.notion.site/api/v3/queryCollection?src=initial_load",
        payload
      );
      const data: Prisma.FoundationalJobCreateInput[] = response.data.recordMap
        .block
        ? Object.values(response.data.recordMap.block)
            .filter(
              (block) =>
                block.value.properties?.title &&
                block.value.properties?.["zs>i"]
            )
            .map((block) => ({
              title: block.value.properties.title[0][0],
              location: block.value.properties["zs>i"][0][0],
              href: `https://foundational-data.notion.site/${block.value.id.replaceAll(
                "-",
                ""
              )}`,
            }))
        : [];
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.FoundationalJobCreateInput[]
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
      "Foundational",
      "https://www.foundational.io/demo",
      2
    );
    return {
      blocks,
      channel: 2,
    };
  }

  static async run() {
    const handler = new FoundationalJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

FoundationalJobHandler.run().then(async (res) => {
  if (res.blocks.length > 0) {
    await buildMessage(res.channel, res.blocks);
  }
});
