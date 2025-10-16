import { WorldJob, Prisma, PrismaClient } from "@prisma/client";

export class WorldJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WorldJob[]> {
    return this.prisma.worldJob.findMany({});
  }

  async createMany(data: Prisma.WorldJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.worldJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating World jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.worldJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting World jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WorldJobCreateInput[]) {
    const deleteJobs: Prisma.WorldJobCreateInput[] = [];
    const updateJobs: Prisma.WorldJobCreateInput[] = [];
    const newJobs: Prisma.WorldJobCreateInput[] = [];
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
