import { Prisma, PrismaClient } from "@prisma/client";
import { MerlinJobRepository } from "./database";
import { JobMessageData, buildJobMessage } from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class MerlinJobHandler {
  constructor(private db = new MerlinJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.MerlinJobCreateInput[]> {
    try {
      const response: {
        data: {
          jobRequisitions: {
            requisitionTitle: string;
            customFieldGroup: {
              stringFields: {
                stringValue?: string;
                nameCode: {
                  codeValue: string;
                };
              }[];
            };
            requisitionLocations: {
              nameCode: {
                shortName: string;
              }[];
            };
          }[];
        };
      } = await axios.get(
        "https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions?cid=7755548e-7665-4c05-8fec-aec728992b42&timeStamp=1760052362600&ccId=9201135652345_2&lang=en_US&ccId=9201135652345_2&locale=en_US&$top=10"
      );
      const data: Prisma.MerlinJobCreateInput[] =
        response.data.jobRequisitions.map((job) => {
          console.log(job);
          const href =
            "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=7755548e-7665-4c05-8fec-aec728992b42&ccId=9201135652345_2&lang=en_US&selectedMenuKey=CurrentOpenings&hsCtaAttrib=187795530398#&jobId=" +
            job.customFieldGroup.stringFields.find(
              (field) => field.nameCode.codeValue === "ExternalJobID"
            )!.stringValue!;
          const title = job.requisitionTitle;
          const location =
            job.requisitionLocations[0]?.nameCode[0]?.shortName ||
            "No Location";
          return { title, location, href };
        });
      console.log(`Scraped ${data.length} jobs from Merlin`);
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(
    jobData: Prisma.MerlinJobCreateInput[]
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
      "Constellation Gov Cloud",
      "https://constellationgov.cloud/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new MerlinJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

// MerlinJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
