import { RoxJob, Prisma, PrismaClient } from "@prisma/client";

export class RoxJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RoxJob[]> {
    return this.prisma.roxJob.findMany({});
  }

  async createMany(data: Prisma.RoxJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.roxJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Rox jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.roxJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Rox jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RoxJobCreateInput[]) {
    const deleteJobs: Prisma.RoxJobCreateInput[] = [];
    const updateJobs: Prisma.RoxJobCreateInput[] = [];
    const newJobs: Prisma.RoxJobCreateInput[] = [];
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
