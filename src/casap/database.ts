import { CasapJob, Prisma, PrismaClient } from "@prisma/client";

export class CasapJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CasapJob[]> {
    return this.prisma.casapJob.findMany({});
  }

  async createMany(data: Prisma.CasapJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.casapJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Casap jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.casapJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Casap jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CasapJobCreateInput[]) {
    const deleteJobs: Prisma.CasapJobCreateInput[] = [];
    const updateJobs: Prisma.CasapJobCreateInput[] = [];
    const newJobs: Prisma.CasapJobCreateInput[] = [];
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
