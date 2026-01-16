import { DispatchJob, Prisma, PrismaClient } from "@prisma/client";

export class DispatchJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DispatchJob[]> {
    return this.prisma.dispatchJob.findMany({});
  }

  async createMany(data: Prisma.DispatchJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dispatchJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dispatch jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dispatchJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dispatch jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DispatchJobCreateInput[]) {
    const deleteJobs: Prisma.DispatchJobCreateInput[] = [];
    const updateJobs: Prisma.DispatchJobCreateInput[] = [];
    const newJobs: Prisma.DispatchJobCreateInput[] = [];
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
