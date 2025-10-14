import { PenteraJob, Prisma, PrismaClient } from "@prisma/client";

export class PenteraJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PenteraJob[]> {
    return this.prisma.penteraJob.findMany({});
  }

  async createMany(data: Prisma.PenteraJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.penteraJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Pentera jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.penteraJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Pentera jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PenteraJobCreateInput[]) {
    const deleteJobs: Prisma.PenteraJobCreateInput[] = [];
    const updateJobs: Prisma.PenteraJobCreateInput[] = [];
    const newJobs: Prisma.PenteraJobCreateInput[] = [];
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
