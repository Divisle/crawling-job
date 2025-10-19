import { HadriusJob, Prisma, PrismaClient } from "@prisma/client";

export class HadriusJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HadriusJob[]> {
    return this.prisma.hadriusJob.findMany({});
  }

  async createMany(data: Prisma.HadriusJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.hadriusJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Hadrius jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.hadriusJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Hadrius jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HadriusJobCreateInput[]) {
    const deleteJobs: Prisma.HadriusJobCreateInput[] = [];
    const updateJobs: Prisma.HadriusJobCreateInput[] = [];
    const newJobs: Prisma.HadriusJobCreateInput[] = [];
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
