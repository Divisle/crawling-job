import { AmebaJob, Prisma, PrismaClient } from "@prisma/client";

export class AmebaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AmebaJob[]> {
    return this.prisma.amebaJob.findMany({});
  }

  async createMany(data: Prisma.AmebaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.amebaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Ameba jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.amebaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Ameba jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AmebaJobCreateInput[]) {
    const deleteJobs: Prisma.AmebaJobCreateInput[] = [];
    const updateJobs: Prisma.AmebaJobCreateInput[] = [];
    const newJobs: Prisma.AmebaJobCreateInput[] = [];
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
