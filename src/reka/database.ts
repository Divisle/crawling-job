import { RekaJob, Prisma, PrismaClient } from "@prisma/client";

export class RekaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RekaJob[]> {
    return this.prisma.rekaJob.findMany({});
  }

  async createMany(data: Prisma.RekaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.rekaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Reka jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.rekaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Reka jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RekaJobCreateInput[]) {
    const deleteJobs: Prisma.RekaJobCreateInput[] = [];
    const updateJobs: Prisma.RekaJobCreateInput[] = [];
    const newJobs: Prisma.RekaJobCreateInput[] = [];
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
