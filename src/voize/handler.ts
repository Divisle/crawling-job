import { PrismaClient } from "@prisma/client";
import { VoizeRepository } from "./database";
import {
	AshbyhqPostApiPayload,
	AshbyhqPostInterface,
	JobMessageData,
	buildJobMessage,
} from "../template";
import axios from "axios";

export class VoizeJobHandler {
	constructor(private db = new VoizeRepository(new PrismaClient())) {
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
				organizationHostedJobsPageName: "voize",
			},
			query:
				"query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {\n  jobBoard: jobBoardWithTeams(\n    organizationHostedJobsPageName: $organizationHostedJobsPageName\n  ) {\n    teams {\n      id\n      name\n      parentTeamId\n      __typename\n    }\n    jobPostings {\n      id\n      title\n      teamId\n      locationId\n      locationName\n      workplaceType\n      employmentType\n      secondaryLocations {\n        ...JobPostingSecondaryLocationParts\n        __typename\n      }\n      compensationTierSummary\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment JobPostingSecondaryLocationParts on JobPostingSecondaryLocation {\n  locationId\n  locationName\n  __typename\n}",
		};

		try {
			const response: {
				data: AshbyhqPostApiPayload;
			} = await axios.post(
				"https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams",
				payload,
			);
			const data: AshbyhqPostInterface[] =
				response.data.data.jobBoard.jobPostings.map((posting) => ({
					jobId: posting.id,
					title: posting.title,
					department:
						response.data.data.jobBoard.teams.find(
							(t) => t.id === posting.teamId,
						)?.name || "No Department",
					location: posting.locationName,
					workplaceType: posting.workplaceType,
					employmentType: posting.employmentType,
					href: `https://www.voize.de/karriere?ashby_jid=${posting.id}`,
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
		const jobs: JobMessageData[] = data.newJobs.map((jobData) => {
			return {
				location: jobData.location,
				title: jobData.title,
				href: jobData.href,
			};
		});

		const blocks = buildJobMessage(jobs, "Voize", "https://en.voize.de/", 1);
		return { blocks, channel: 1 };
	}

	static async run() {
		const handler = new VoizeJobHandler();
		const data = await handler.scrapeJobs();
		const filteredData = await handler.filterData(data);
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
