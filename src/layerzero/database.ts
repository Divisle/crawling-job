import { LayerzeroJob, Prisma, PrismaClient } from "@prisma/client";

export class LayerzeroJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LayerzeroJob[]> {
    return this.prisma.layerzeroJob.findMany({});
  }

  async createMany(data: Prisma.LayerzeroJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.layerzeroJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Layerzero jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.layerzeroJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Layerzero jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LayerzeroJobCreateInput[]) {
    const deleteJobs: Prisma.LayerzeroJobCreateInput[] = [];
    const updateJobs: Prisma.LayerzeroJobCreateInput[] = [];
    const newJobs: Prisma.LayerzeroJobCreateInput[] = [];
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
