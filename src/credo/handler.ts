import { CredoJob, Prisma, PrismaClient } from "@prisma/client";
import { CredoJobRepository } from "./database";
import { CredoApiPayload } from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";
export class CredoJobHandler {
  private app: WebClient;
  constructor(private db = new CredoJobRepository(new PrismaClient())) {
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
        data: CredoApiPayload;
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

  async handleJobData(jobData: Prisma.CredoJobCreateInput[]) {
    const filteredData = await this.filterData(jobData);
    // await this.sendMessage(filteredData);
  }

  async filterData(jobData: Prisma.CredoJobCreateInput[]): Promise<{
    newJobs: Prisma.CredoJobCreateInput[];
    deleteJobs: Prisma.CredoJobCreateInput[];
    updateJobs: Prisma.CredoJobCreateInput[];
  }> {
    const filterData = await this.db.compareData(jobData);

    await this.db.deleteMany(
      filterData.deleteJobs
        .filter((job) => job.id !== undefined)
        .map((job) => job.id!)
    );
    await this.db.createMany(filterData.newJobs);
    await this.db.updateMany(filterData.updateJobs);
    return filterData;
  }

  static async run() {
    const handler = new CredoJobHandler();
    const data = await handler.scrapeJobs();
    const filteredData = await handler.filterData(data);
    await handler.sendMessage(filteredData);
  }
}

CredoJobHandler.run();
