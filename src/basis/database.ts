import { BasisJob, Prisma, PrismaClient } from "@prisma/client";

export class BasisJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BasisJob[]> {
    return this.prisma.basisJob.findMany({});
  }

  async createMany(data: Prisma.BasisJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.basisJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Basis jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.basisJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Basis jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BasisJobCreateInput[]) {
    const deleteJobs: Prisma.BasisJobCreateInput[] = [];
    const updateJobs: Prisma.BasisJobCreateInput[] = [];
    const newJobs: Prisma.BasisJobCreateInput[] = [];
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
