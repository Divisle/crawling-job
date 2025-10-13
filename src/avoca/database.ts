import { AvocaJob, Prisma, PrismaClient } from "@prisma/client";

export class AvocaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AvocaJob[]> {
    return this.prisma.avocaJob.findMany({});
  }

  async createMany(data: Prisma.AvocaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.avocaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Avoca jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.avocaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Avoca jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AvocaJobCreateInput[]) {
    const deleteJobs: Prisma.AvocaJobCreateInput[] = [];
    const updateJobs: Prisma.AvocaJobCreateInput[] = [];
    const newJobs: Prisma.AvocaJobCreateInput[] = [];
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
