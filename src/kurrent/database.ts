import { KurrentJob, Prisma, PrismaClient } from "@prisma/client";

export class KurrentJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<KurrentJob[]> {
    return this.prisma.kurrentJob.findMany({});
  }

  async createMany(data: Prisma.KurrentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.kurrentJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Kurrent jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.kurrentJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Kurrent jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.KurrentJobCreateInput[]) {
    const deleteJobs: Prisma.KurrentJobCreateInput[] = [];
    const updateJobs: Prisma.KurrentJobCreateInput[] = [];
    const newJobs: Prisma.KurrentJobCreateInput[] = [];
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
