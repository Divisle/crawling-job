import { BrowserbaseJob, Prisma, PrismaClient } from "@prisma/client";

export class BrowserbaseJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BrowserbaseJob[]> {
    return this.prisma.browserbaseJob.findMany({});
  }

  async createMany(data: Prisma.BrowserbaseJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.browserbaseJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Browserbase jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.browserbaseJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Browserbase jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BrowserbaseJobCreateInput[]) {
    const deleteJobs: Prisma.BrowserbaseJobCreateInput[] = [];
    const updateJobs: Prisma.BrowserbaseJobCreateInput[] = [];
    const newJobs: Prisma.BrowserbaseJobCreateInput[] = [];
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
