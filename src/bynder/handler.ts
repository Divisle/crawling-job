import { Prisma, PrismaClient } from "@prisma/client";
import { BynderJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class BynderJobHandler {
  constructor(private db = new BynderJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.BynderJobCreateInput[]> {
    try {
      const response: {
        data: string;
      } = await axios.get(
        "https://careers.bynder.com/greenhouse.php?fq=facet_department:(Catering%3BCustomer%20Success%20%26%20Support%3BOnboarding%3BDesign%3BEngineering%3BFinance%3BInformation%20Security%3BInfosec%3BHuman%20Resources%3BLegal%3BMarketing%3BOffice%20Management%3BOperations%3BPeople%20%26%20Talent%3BProcurement%3BProduct%3BProduct%20Management%3BProject%20Management%3BSales%3BSolutions%3BIT%20Department%3BCustomer%20Onboarding%20Intern%3BCustomer%20Success%20Intern%3BDesign%20Intern%3BEngineering%20Intern%3BFinance%20Intern%3BG%26A%3BR%26D%3BR%26D%20Product%3BR%26D%20Engineering)&callback=jQuery400207932597033434694_1759980460591&_=1759980460592"
      );
      const jobData: {
        results: {
          [key: string]: {
            location: string;
            vacancyName: string;
            jobVacancyId: string;
            urlJobName: string;
          };
        };
      } = JSON.parse(
        response.data.substring(
          response.data.indexOf("(") + 1,
          response.data.lastIndexOf(")")
        )
      );
      const data: Prisma.BynderJobCreateInput[] = Object.values(
        jobData.results
      ).map((job) => ({
        title: job.vacancyName,
        location: job.location,
        href:
          "https://careers.bynder.com/openings/" +
          job.jobVacancyId +
          "-" +
          job.urlJobName,
      }));
      // console.log(`Scraped ${data.length} jobs from Bynder`);
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.BynderJobCreateInput[]
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
      "Bynder",
      "https://www.bynder.com/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new BynderJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// BynderJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
