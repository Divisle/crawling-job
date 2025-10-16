import { FableJob, Prisma, PrismaClient } from "@prisma/client";

export class FableJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FableJob[]> {
    return this.prisma.fableJob.findMany({});
  }

  async createMany(data: Prisma.FableJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.fableJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Fable jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.fableJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Fable jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FableJobCreateInput[]) {
    const deleteJobs: Prisma.FableJobCreateInput[] = [];
    const updateJobs: Prisma.FableJobCreateInput[] = [];
    const newJobs: Prisma.FableJobCreateInput[] = [];
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
