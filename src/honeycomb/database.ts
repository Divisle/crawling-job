import { HoneycombJob, Prisma, PrismaClient } from "@prisma/client";

export class HoneycombJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HoneycombJob[]> {
    return this.prisma.honeycombJob.findMany({});
  }

  async createMany(data: Prisma.HoneycombJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.honeycombJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Honeycomb jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.honeycombJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Honeycomb jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HoneycombJobCreateInput[]) {
    const deleteJobs: Prisma.HoneycombJobCreateInput[] = [];
    const updateJobs: Prisma.HoneycombJobCreateInput[] = [];
    const newJobs: Prisma.HoneycombJobCreateInput[] = [];
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
