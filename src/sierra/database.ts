import { SierraJob, Prisma, PrismaClient } from "@prisma/client";

export class SierraJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SierraJob[]> {
    return this.prisma.sierraJob.findMany({});
  }

  async createMany(data: Prisma.SierraJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.sierraJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Sierra jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.sierraJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Sierra jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SierraJobCreateInput[]) {
    const deleteJobs: Prisma.SierraJobCreateInput[] = [];
    const updateJobs: Prisma.SierraJobCreateInput[] = [];
    const newJobs: Prisma.SierraJobCreateInput[] = [];
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
