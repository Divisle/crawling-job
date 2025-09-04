import { Prisma, PrismaClient } from "@prisma/client";
import { CredoJobRepository } from "./database";
import { buildCredoJobMessage, AshbyhqPostApiPayload } from "../template";
import { buildMessage } from "../global";
import axios from "axios";
export class CredoJobHandler {
  constructor(private db = new CredoJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
  }

  async scrapeJobs(): Promise<Prisma.CredoJobCreateInput[]> {
    const payload = {
      operationName: "ApiJobBoardWithTeams",
      variables: {
        organizationHostedJobsPageName: "credo.ai",
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
      const data: Prisma.CredoJobCreateInput[] =
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
          href: `https://www.credo.ai/jobs?ashby_jid=${posting.id}`,
        }));
      return data;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  async filterData(jobData: Prisma.CredoJobCreateInput[]): Promise<{
    newJobs: Prisma.CredoJobCreateInput[];
    deleteJobs: Prisma.CredoJobCreateInput[];
    updateJobs: Prisma.CredoJobUpdateInput[];
  }> {
    const filterData = await this.db.compareData(jobData);
    if (filterData.deleteJobs.length > 0) {
      await this.db.deleteMany(
        filterData.deleteJobs
          .filter((job) => job.id !== undefined)
          .map((job) => job.id!)
      );
    }
    if (filterData.newJobs.length > 0) {
      await this.db.createMany(filterData.newJobs);
    }
    if (filterData.updateJobs.length > 0) {
      await this.db.deleteMany(
        filterData.updateJobs.map((job) => job.id!.toString())
      );
      await this.db.createMany(
        filterData.updateJobs.map((job) => {
          const { id, ...rest } = job;
          return rest as Prisma.CredoJobCreateInput;
        })
      );
    }
    return filterData;
  }

  async sendMessage(data: {
    newJobs: Prisma.CredoJobCreateInput[];
    deleteJobs: Prisma.CredoJobCreateInput[];
    updateJobs: Prisma.CredoJobUpdateInput[];
  }) {
    const blocks = await buildCredoJobMessage(data);
    try {
      buildMessage(1, blocks);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  static async run() {
    const handler = new CredoJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    await handler.sendMessage(filteredData);
  }
}
