import { BynderJob, Prisma, PrismaClient } from "@prisma/client";

export class BynderJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BynderJob[]> {
    return this.prisma.bynderJob.findMany({});
  }

  async createMany(data: Prisma.BynderJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.bynderJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Bynder jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.bynderJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Bynder jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BynderJobCreateInput[]) {
    const deleteJobs: Prisma.BynderJobCreateInput[] = [];
    const updateJobs: Prisma.BynderJobCreateInput[] = [];
    const newJobs: Prisma.BynderJobCreateInput[] = [];
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
