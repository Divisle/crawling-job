import { SeonJob, Prisma, PrismaClient } from "@prisma/client";

export class SeonJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SeonJob[]> {
    return this.prisma.seonJob.findMany({});
  }

  async createMany(data: Prisma.SeonJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.seonJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Seon jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.seonJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Seon jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SeonJobCreateInput[]) {
    const deleteJobs: Prisma.SeonJobCreateInput[] = [];
    const updateJobs: Prisma.SeonJobCreateInput[] = [];
    const newJobs: Prisma.SeonJobCreateInput[] = [];
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
