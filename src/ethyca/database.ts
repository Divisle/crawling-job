import { EthycaJob, Prisma, PrismaClient } from "@prisma/client";

export class EthycaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EthycaJob[]> {
    return this.prisma.ethycaJob.findMany({});
  }

  async createMany(data: Prisma.EthycaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.ethycaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Ethyca jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.ethycaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Ethyca jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EthycaJobCreateInput[]) {
    const deleteJobs: Prisma.EthycaJobCreateInput[] = [];
    const updateJobs: Prisma.EthycaJobCreateInput[] = [];
    const newJobs: Prisma.EthycaJobCreateInput[] = [];
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
