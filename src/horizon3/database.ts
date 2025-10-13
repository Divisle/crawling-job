import { Horizon3Job, Prisma, PrismaClient } from "@prisma/client";

export class Horizon3JobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<Horizon3Job[]> {
    return this.prisma.horizon3Job.findMany({});
  }

  async createMany(data: Prisma.Horizon3JobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.horizon3Job.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Horizon3 jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.horizon3Job.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Horizon3 jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.Horizon3JobCreateInput[]) {
    const deleteJobs: Prisma.Horizon3JobCreateInput[] = [];
    const updateJobs: Prisma.Horizon3JobCreateInput[] = [];
    const newJobs: Prisma.Horizon3JobCreateInput[] = [];
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
