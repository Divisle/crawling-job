import { Adaptive6Job, Prisma, PrismaClient } from "@prisma/client";

export class Adaptive6JobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<Adaptive6Job[]> {
    return this.prisma.adaptive6Job.findMany({});
  }

  async createMany(data: Prisma.Adaptive6JobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.adaptive6Job.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Adaptive6 jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.adaptive6Job.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Adaptive6 jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.Adaptive6JobCreateInput[]) {
    const deleteJobs: Prisma.Adaptive6JobCreateInput[] = [];
    const updateJobs: Prisma.Adaptive6JobCreateInput[] = [];
    const newJobs: Prisma.Adaptive6JobCreateInput[] = [];
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
