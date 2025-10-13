import { LinearJob, Prisma, PrismaClient } from "@prisma/client";

export class LinearJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LinearJob[]> {
    return this.prisma.linearJob.findMany({});
  }

  async createMany(data: Prisma.LinearJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.linearJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Linear jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.linearJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Linear jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LinearJobCreateInput[]) {
    const deleteJobs: Prisma.LinearJobCreateInput[] = [];
    const updateJobs: Prisma.LinearJobCreateInput[] = [];
    const newJobs: Prisma.LinearJobCreateInput[] = [];
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
