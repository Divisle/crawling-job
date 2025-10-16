import { BolsterJob, Prisma, PrismaClient } from "@prisma/client";

export class BolsterJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BolsterJob[]> {
    return this.prisma.bolsterJob.findMany({});
  }

  async createMany(data: Prisma.BolsterJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.bolsterJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Bolster jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.bolsterJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Bolster jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BolsterJobCreateInput[]) {
    const deleteJobs: Prisma.BolsterJobCreateInput[] = [];
    const updateJobs: Prisma.BolsterJobCreateInput[] = [];
    const newJobs: Prisma.BolsterJobCreateInput[] = [];
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
