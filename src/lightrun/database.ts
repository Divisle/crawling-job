import { LightrunJob, Prisma, PrismaClient } from "@prisma/client";

export class LightrunJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LightrunJob[]> {
    return this.prisma.lightrunJob.findMany({});
  }

  async createMany(data: Prisma.LightrunJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lightrunJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Lightrun jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lightrunJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Lightrun jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LightrunJobCreateInput[]) {
    const deleteJobs: Prisma.LightrunJobCreateInput[] = [];
    const updateJobs: Prisma.LightrunJobCreateInput[] = [];
    const newJobs: Prisma.LightrunJobCreateInput[] = [];
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
