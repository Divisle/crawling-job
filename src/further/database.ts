import { FurtherJob, Prisma, PrismaClient } from "@prisma/client";

export class FurtherJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FurtherJob[]> {
    return this.prisma.furtherJob.findMany({});
  }

  async createMany(data: Prisma.FurtherJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.furtherJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Further jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.furtherJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Further jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FurtherJobCreateInput[]) {
    const deleteJobs: Prisma.FurtherJobCreateInput[] = [];
    const updateJobs: Prisma.FurtherJobCreateInput[] = [];
    const newJobs: Prisma.FurtherJobCreateInput[] = [];
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
