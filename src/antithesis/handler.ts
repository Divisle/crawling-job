import { PrismaClient } from "@prisma/client";
import { AntithesisRepository } from "./database";
import {
  AshbyhqPostApiPayload,
  buildAshbyhqPostMessage,
  AshbyhqPostInterface,
  JobMessageData,
  buildJobMessage,
} from "../template";
import axios from "axios";
import { buildMessage } from "../global";

export class AntithesisJobHandler {
  constructor(private db = new AntithesisRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<AshbyhqPostInterface[]> {
    const payload = {
      operationName: "ApiJobBoardWithTeams",
      variables: {
        organizationHostedJobsPageName: "antithesis",
      },
      query:
        "query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {\n  jobBoard: jobBoardWithTeams(\n    organizationHostedJobsPageName: $organizationHostedJobsPageName\n  ) {\n    teams {\n      id\n      name\n      parentTeamId\n      __typename\n    }\n    jobPostings {\n      id\n      title\n      teamId\n      locationId\n      locationName\n      workplaceType\n      employmentType\n      secondaryLocations {\n        ...JobPostingSecondaryLocationParts\n        __typename\n      }\n      compensationTierSummary\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment JobPostingSecondaryLocationParts on JobPostingSecondaryLocation {\n  locationId\n  locationName\n  __typename\n}",
    };

    try {
      const response: {
        data: AshbyhqPostApiPayload;
      } = await axios.post(
        "https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams",
        payload
      );
      const data: AshbyhqPostInterface[] =
        response.data.data.jobBoard.jobPostings.map((posting) => ({
          jobId: posting.id,
          title: posting.title,
          department:
            response.data.data.jobBoard.teams.find(
              (t) => t.id === posting.teamId
            )?.name || "No Department",
          location: posting.locationName,
          workplaceType: posting.workplaceType,
          employmentType: posting.employmentType,
          href: `https://jobs.ashbyhq.com/checkly/${posting.id}`,
          ashbyhqLocation: posting.secondaryLocations.map((loc) => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
          })),
        }));
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(jobData: AshbyhqPostInterface[]): Promise<JobMessageData[]> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => ({
        jobId: job.jobId,
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
      "Antithesis",
      "https://antithesis.com/",
      1
    );
    return {
      blocks,
      channel: 1,
    };
  }

  static async run() {
    const handler = new AntithesisJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      return { blocks: [] as any[], channel: 0 };
    }
    return await handler.sendMessage(filteredData);
  }
}

AntithesisJobHandler.run().then(async (res) => {
  if (res.blocks.length > 0) {
    await buildMessage(res.channel, res.blocks);
  }
});
