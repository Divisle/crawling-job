import { AkeylessJob, Prisma, PrismaClient } from "@prisma/client";

export class AkeylessJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AkeylessJob[]> {
    return this.prisma.akeylessJob.findMany({});
  }

  async createMany(data: Prisma.AkeylessJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.akeylessJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Akeyless jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.akeylessJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Akeyless jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AkeylessJobCreateInput[]) {
    const deleteJobs: Prisma.AkeylessJobCreateInput[] = [];
    const updateJobs: Prisma.AkeylessJobCreateInput[] = [];
    const newJobs: Prisma.AkeylessJobCreateInput[] = [];
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
