import { HalcyonJob, Prisma, PrismaClient } from "@prisma/client";

export class HalcyonJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HalcyonJob[]> {
    return this.prisma.halcyonJob.findMany({});
  }

  async createMany(data: Prisma.HalcyonJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.halcyonJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Halcyon jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.halcyonJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Halcyon jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HalcyonJobCreateInput[]) {
    const deleteJobs: Prisma.HalcyonJobCreateInput[] = [];
    const updateJobs: Prisma.HalcyonJobCreateInput[] = [];
    const newJobs: Prisma.HalcyonJobCreateInput[] = [];
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
