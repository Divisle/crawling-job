import { DideroJob, Prisma, PrismaClient } from "@prisma/client";

export class DideroJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DideroJob[]> {
    return this.prisma.dideroJob.findMany({});
  }

  async createMany(data: Prisma.DideroJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dideroJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Didero jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dideroJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Didero jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DideroJobCreateInput[]) {
    const deleteJobs: Prisma.DideroJobCreateInput[] = [];
    const updateJobs: Prisma.DideroJobCreateInput[] = [];
    const newJobs: Prisma.DideroJobCreateInput[] = [];
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
