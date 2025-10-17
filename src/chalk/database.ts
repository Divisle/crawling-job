import { ChalkJob, Prisma, PrismaClient } from "@prisma/client";

export class ChalkJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ChalkJob[]> {
    return this.prisma.chalkJob.findMany({});
  }

  async createMany(data: Prisma.ChalkJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.chalkJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Chalk jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.chalkJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Chalk jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ChalkJobCreateInput[]) {
    const deleteJobs: Prisma.ChalkJobCreateInput[] = [];
    const updateJobs: Prisma.ChalkJobCreateInput[] = [];
    const newJobs: Prisma.ChalkJobCreateInput[] = [];
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
