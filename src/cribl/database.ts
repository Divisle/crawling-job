import { CriblJob, Prisma, PrismaClient } from "@prisma/client";

export class CriblJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CriblJob[]> {
    return this.prisma.criblJob.findMany({});
  }

  async createMany(data: Prisma.CriblJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.criblJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cribl jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.criblJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cribl jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CriblJobCreateInput[]) {
    const deleteJobs: Prisma.CriblJobCreateInput[] = [];
    const updateJobs: Prisma.CriblJobCreateInput[] = [];
    const newJobs: Prisma.CriblJobCreateInput[] = [];
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
