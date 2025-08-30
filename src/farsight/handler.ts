import { Prisma, PrismaClient } from "@prisma/client";
import { FarSightRepository } from "./database";
import {
  buildFarSightJobsMessage,
  FarSightApiPayload,
  // buildFarSightPostMessage,
  FarSightJobInterface,
} from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";

export class FarSightJobHandler {
  private app: WebClient;
  constructor(private db = new FarSightRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
    this.app = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  async scrapeJobs(): Promise<FarSightJobInterface[]> {
    const response: {
      data: FarSightApiPayload[];
    } = await axios.get(
      "https://app.dover.com/api/v1/job-groups/54b8d0ef-b283-40d2-be76-5586ddd82708/job-groups"
    );
    return response.data[0].jobs.map((job) => ({
      jobId: job.id,
      title: job.title,
      href: `https://app.dover.com/apply/Farsight%20AI/${job.id}`,
      locations: job.locations.map((loc) => ({
        locationName: loc.name,
        locationId: loc.location_option.id,
        locationType: loc.location_type,
      })),
    }));
  }

  async filterData(data: FarSightJobInterface[]): Promise<{
    newJobs: FarSightJobInterface[];
    updateJobs: FarSightJobInterface[];
    deleteJobs: FarSightJobInterface[];
  }> {
    const filteredData = await this.db.compareData(data);
    const listDeleteId = [
      ...filteredData.deleteJobs.map((job) => job.id!),
      ...filteredData.updateJobs.map((job) => job.id!),
    ];
    const listNewJobs = [...filteredData.newJobs, ...filteredData.updateJobs];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listNewJobs);
    return filteredData;
  }

  async sendMessage(data: {
    newJobs: FarSightJobInterface[];
    deleteJobs: FarSightJobInterface[];
    updateJobs: FarSightJobInterface[];
  }) {
    const blocks = buildFarSightJobsMessage(data);
    await this.app.chat.postMessage({
      // channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      channel: process.env.SLACK_TEST_CHANNEL_ID!,
      blocks,
    });
  }

  static async run() {
    const handler = new FarSightJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    await handler.sendMessage(filteredData);
  }
}

FarSightJobHandler.run();
