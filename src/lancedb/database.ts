import { LancedbJob, Prisma, PrismaClient } from "@prisma/client";

export class LancedbJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LancedbJob[]> {
    return this.prisma.lancedbJob.findMany({});
  }

  async createMany(data: Prisma.LancedbJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lancedbJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Lancedb jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lancedbJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Lancedb jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LancedbJobCreateInput[]) {
    const deleteJobs: Prisma.LancedbJobCreateInput[] = [];
    const updateJobs: Prisma.LancedbJobCreateInput[] = [];
    const newJobs: Prisma.LancedbJobCreateInput[] = [];
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
