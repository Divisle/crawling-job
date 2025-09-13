import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildRecruitmentJobMessage,
  RecruitmentApiPayload,
  RecruitmentTokenPayload,
} from "../template";
import { buildMessage } from "../global";
import axios from "axios";
import { RecruitmentRepository } from "./database";
export class RecruitmentJobHandler {
  constructor(private db = new RecruitmentRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.RecruitmentJobCreateInput[]> {
    try {
      const jobData: Prisma.RecruitmentJobCreateInput[] = [];
      const requestCookies: {
        data: RecruitmentTokenPayload;
      } = await axios.get(
        "https://www.recruitmentpeople.io/_api/v1/access-tokens"
      );
      const cookie = `svSession=${requestCookies.data.svSession};`;
      const response: {
        data: RecruitmentApiPayload;
      } = await axios.get(
        "https://www.recruitmentpeople.io/_api/dynamic-pages-router/v1/pages?H4sIAAAAAAAAA6WT3WvbMBDA/xWjpxXs+jNxnLeOMcigENqtL2MMWTp7ahXLO8tx08z/+05OytIMRmAv4k73qZ/u9qxHvebINx1b7lmNSt607UqyJcsqCSISaSCqbB5kQBIvyyIoZkU2yyCuRFYxn20VDLdGAkV0ygIbfVYauXPZ0PQWcI1QqWcyh4+m7ChCmKZStXNouSWHZiodHi5quDPaJcvLFFIu8iCfCxFkCy6CooziIM7iOJrJOFnMEkpmlZ3cP1Fu75d3BwJ7ZTfQWG8NpiXbaUFhtAZhlWmOITGZXdF79UJZ4sRn2gyAgnekWuzBZ51By5Zf9+y7QOAW5Ac6KFxCJ9j4jRzAPCQH73HSbsHyz7zuDgxKY0liqpHwTNVcGKr22MN7NEMHnunREz2ia7tGLnsq4XsWuWqABN5Ij0y4CzRsQXt48krTttRg3yiroLumAk+wGwxKV5M0Uy/Vhh7otJHaC/f0Cys5ntGWqeRzmPEgzdOMaCdVsEijeQCQRSLOIMnT8oT2fhLG/wf+L970CEAK45dwfov12N9bGn8uT6H45180jo7TK5sp+UWzSH7K7c1LaqU+n8x3N1pfud24CPRrqsciL6K/UtFJ2CugaRFwNf0qws8eOrtqKuOCodmSdznNFlJ8ZXDzkQtr8DC3T9a0rpnDgt731XFBnWuv9RfUpP2wtu2WYTgMw/XJwLXTJ18rM61zOPHT8MBRcQff8SKAvwHK/oIfWAQAAA==",
        {
          headers: {
            Cookie: cookie,
          },
        }
      );
      for (const job of response.data.result.data.items) {
        jobData.push({
          jobId: job.jobId,
          title: job.title,
          location: job.location.formatted,
          salary: job.salary,
          href: `https://www.recruitmentpeople.io${job["link-jobs-1-title"]}`,
        });
      }
      return jobData;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(data: Prisma.RecruitmentJobCreateInput[]) {
    const filteredData = await this.db.compareData(data);
    const listDeleteId = [
      ...filteredData.deleteJobs.map((job) => job.id as string),
      ...filteredData.updateJobs.map((job) => job.id as string),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...jobData } = job;
        return jobData;
      }),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(data: {
    newJobs: Prisma.RecruitmentJobCreateInput[];
    updateJobs: Prisma.RecruitmentJobCreateInput[];
    deleteJobs: Prisma.RecruitmentJobCreateInput[];
  }) {
    const blocks = buildRecruitmentJobMessage(data);
    return { blocks, channel: 1 };
  }
  static async run() {
    const handler = new RecruitmentJobHandler();
    const jobs = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobs);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}
