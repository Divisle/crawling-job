import { SgnlJob, Prisma, PrismaClient } from "@prisma/client";

export class SgnlJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SgnlJob[]> {
    return this.prisma.sgnlJob.findMany({});
  }

  async createMany(data: Prisma.SgnlJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.sgnlJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Sgnl jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.sgnlJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Sgnl jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SgnlJobCreateInput[]) {
    const deleteJobs: Prisma.SgnlJobCreateInput[] = [];
    const updateJobs: Prisma.SgnlJobCreateInput[] = [];
    const newJobs: Prisma.SgnlJobCreateInput[] = [];
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
