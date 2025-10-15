import { LakeraJob, Prisma, PrismaClient } from "@prisma/client";

export class LakeraJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LakeraJob[]> {
    return this.prisma.lakeraJob.findMany({});
  }

  async createMany(data: Prisma.LakeraJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lakeraJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Lakera jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lakeraJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Lakera jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LakeraJobCreateInput[]) {
    const deleteJobs: Prisma.LakeraJobCreateInput[] = [];
    const updateJobs: Prisma.LakeraJobCreateInput[] = [];
    const newJobs: Prisma.LakeraJobCreateInput[] = [];
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
