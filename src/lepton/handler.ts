import { Prisma, PrismaClient } from "@prisma/client";
import { LeptonJobRepository } from "./database";
import { buildMessage } from "../global";
import { buildDefault1JobMessage, LeptonApiPayload } from "../template";
import axios from "axios";
export class LeptonJobScraper {
  constructor(private db = new LeptonJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.LeptonCreateInput[]> {
    const jobData: Prisma.LeptonCreateInput[] = [];
    const payload = {
      appliedFacets: {},
      limit: 20,
      offset: 0,
      searchText: "",
    };
    const result: {
      data: LeptonApiPayload;
    } = await axios.post(
      "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs",
      payload
    );
    const total = result.data.total;
    let index = 0;
    while (index < total) {
      const nextResult: {
        data: LeptonApiPayload;
      } = await axios.post(
        "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs",
        {
          appliedFacets: {},
          limit: 20,
          offset: index,
          searchText: "",
        }
      );
      for (const job of nextResult.data.jobPostings) {
        if (!job.externalPath || !job.title || !job.locationsText) {
          continue;
        }
        jobData.push({
          title: job.title,
          location: job.locationsText,
          href: `https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite${job.externalPath}`,
        });
      }
      index += 20;
    }
    return jobData;
  }

  async filterData(jobData: Prisma.LeptonCreateInput[]): Promise<{
    newJobs: Prisma.LeptonCreateInput[];
    deleteJobs: Prisma.LeptonCreateInput[];
    updateJobs: Prisma.LeptonCreateInput[];
  }> {
    const filteredData = await this.db.compareData(jobData);
    const listDeletedIds = [
      ...filteredData.deleteJobs.map((job) => job.id!),
      ...filteredData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...rest } = job;
        return {
          ...rest,
        };
      }),
    ];
    await this.db.deleteMany(listDeletedIds);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(messageData: {
    newJobs: Prisma.LeptonCreateInput[];
    deleteJobs: Prisma.LeptonCreateInput[];
    updateJobs: Prisma.LeptonCreateInput[];
  }) {
    const blocks = await buildDefault1JobMessage(
      messageData,
      "Lepton",
      "https://www.lepton.ai"
    );
    return { blocks, channel: 2 };
  }

  static async run() {
    const scraper = new LeptonJobScraper();
    const data = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(data);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await scraper.sendMessage(filteredData);
  }
}
