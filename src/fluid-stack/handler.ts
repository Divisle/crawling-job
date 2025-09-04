import { Prisma, PrismaClient } from "@prisma/client";
import { FluidStackRepository } from "./database";
import {
  AshbyhqPostApiPayload,
  buildAshbyhqPostMessage,
  AshbyhqPostInterface,
} from "../template";
import { buildMessage } from "../global";
import axios from "axios";

export class FluidStackJobHandler {
  constructor(private db = new FluidStackRepository(new PrismaClient())) {
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
        organizationHostedJobsPageName: "fluidstack",
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
          href: `https://jobs.ashbyhq.com/fluidstack/${posting.id}`,
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

  async filterData(jobData: AshbyhqPostInterface[]): Promise<{
    newJobs: AshbyhqPostInterface[];
    deleteJobs: AshbyhqPostInterface[];
    updateJobs: AshbyhqPostInterface[];
  }> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => ({
        ...job,
        id: undefined,
      })),
    ];
    if (listDeleteId.length !== 0) {
      await this.db.deleteMany(listDeleteId);
    }
    if (listCreateData.length !== 0) {
      await this.db.createMany(listCreateData);
    }
    return filterData;
  }

  async sendMessage(data: {
    newJobs: AshbyhqPostInterface[];
    deleteJobs: AshbyhqPostInterface[];
    updateJobs: AshbyhqPostInterface[];
  }) {
    const blocks = await buildAshbyhqPostMessage(
      data,
      "FluidStack",
      "https://www.fluidstack.io/"
    );
    try {
      buildMessage(1, blocks);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  static async run() {
    const handler = new FluidStackJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    await handler.sendMessage(filteredData);
  }
}

FluidStackJobHandler.run();
