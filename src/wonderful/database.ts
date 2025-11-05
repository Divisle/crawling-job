import { WonderfulJob, Prisma, PrismaClient } from "@prisma/client";

export class WonderfulJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WonderfulJob[]> {
    return this.prisma.wonderfulJob.findMany({});
  }

  async createMany(data: Prisma.WonderfulJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.wonderfulJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Wonderful jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.wonderfulJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Wonderful jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WonderfulJobCreateInput[]) {
    const deleteJobs: Prisma.WonderfulJobCreateInput[] = [];
    const updateJobs: Prisma.WonderfulJobCreateInput[] = [];
    const newJobs: Prisma.WonderfulJobCreateInput[] = [];
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
