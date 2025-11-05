import { GladiaJob, Prisma, PrismaClient } from "@prisma/client";

export class GladiaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<GladiaJob[]> {
    return this.prisma.gladiaJob.findMany({});
  }

  async createMany(data: Prisma.GladiaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.gladiaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Gladia jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.gladiaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Gladia jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GladiaJobCreateInput[]) {
    const deleteJobs: Prisma.GladiaJobCreateInput[] = [];
    const updateJobs: Prisma.GladiaJobCreateInput[] = [];
    const newJobs: Prisma.GladiaJobCreateInput[] = [];
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
