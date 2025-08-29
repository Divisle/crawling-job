import { Prisma, PrismaClient } from "@prisma/client";
import { ChecklyRepository } from "./database";
import { AshbyhqPostApiPayload, ChecklyJobInterface } from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";

export class ChecklyJobHandler {
  private app: WebClient;
  constructor(private db = new ChecklyRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<ChecklyJobInterface[]> {
    const payload = {
      operationName: "ApiJobBoardWithTeams",
      variables: {
        organizationHostedJobsPageName: "checkly",
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
      const data: ChecklyJobInterface[] =
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
          checklyLocation: posting.secondaryLocations.map((loc) => ({
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

  async filterData(jobData: ChecklyJobInterface[]): Promise<{
    newJobs: ChecklyJobInterface[];
    deleteJobs: ChecklyJobInterface[];
    updateJobs: ChecklyJobInterface[];
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
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listCreateData);
    return filterData;
  }

  async sendMessage(data: {
    newJobs: Prisma.LaurelJobCreateInput[];
    deleteJobs: Prisma.LaurelJobCreateInput[];
    updateJobs: Prisma.LaurelJobCreateInput[];
  }) {
    // const blocks = await buildLaurelJobMessage(data);
    try {
      await this.app.chat.postMessage({
        // channel: process.env.SLACK_TEST_CHANNEL_ID!,
        channel: process.env.SLACK_FIRST_CHANNEL_ID!,
        // blocks,
        blocks: [],
      });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  static async run() {
    const handler = new ChecklyJobHandler();
    console.log(handler);
    const data = await handler.scrapeJobs();
    console.log(data);
    const filteredData = await handler.filterData(data);
    console.log(filteredData);
    // await handler.sendMessage(filteredData);
  }
}

ChecklyJobHandler.run();
