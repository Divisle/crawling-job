import { SevenAIJob, Prisma, PrismaClient } from "@prisma/client";

export class SevenAIRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SevenAIJob[]> {
    return this.prisma.sevenAIJob.findMany({});
  }

  async createMany(data: Prisma.SevenAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.sevenAIJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Seven AI jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.sevenAIJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Seven AI jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SevenAIJobCreateInput[]) {
    const deleteJobs: Prisma.SevenAIJobCreateInput[] = [];
    const updateJobs: Prisma.SevenAIJobCreateInput[] = [];
    const newJobs: Prisma.SevenAIJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.href === job.href);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
