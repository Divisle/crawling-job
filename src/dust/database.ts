import { DustJob, Prisma, PrismaClient } from "@prisma/client";

export class DustJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DustJob[]> {
    return this.prisma.dustJob.findMany({});
  }

  async createMany(data: Prisma.DustJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dustJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dust jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dustJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dust jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DustJobCreateInput[]) {
    const deleteJobs: Prisma.DustJobCreateInput[] = [];
    const updateJobs: Prisma.DustJobCreateInput[] = [];
    const newJobs: Prisma.DustJobCreateInput[] = [];
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
