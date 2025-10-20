import { SapienJob, Prisma, PrismaClient } from "@prisma/client";

export class SapienJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SapienJob[]> {
    return this.prisma.sapienJob.findMany({});
  }

  async createMany(data: Prisma.SapienJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.sapienJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Sapien jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.sapienJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Sapien jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SapienJobCreateInput[]) {
    const deleteJobs: Prisma.SapienJobCreateInput[] = [];
    const updateJobs: Prisma.SapienJobCreateInput[] = [];
    const newJobs: Prisma.SapienJobCreateInput[] = [];
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
