import { AxionJob, Prisma, PrismaClient } from "@prisma/client";

export class AxionJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AxionJob[]> {
    return this.prisma.axionJob.findMany({});
  }

  async createMany(data: Prisma.AxionJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.axionJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Axion jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.axionJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Axion jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AxionJobCreateInput[]) {
    const deleteJobs: Prisma.AxionJobCreateInput[] = [];
    const updateJobs: Prisma.AxionJobCreateInput[] = [];
    const newJobs: Prisma.AxionJobCreateInput[] = [];
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
