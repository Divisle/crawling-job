import { MindsdbJob, Prisma, PrismaClient } from "@prisma/client";

export class MindsdbJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MindsdbJob[]> {
    return this.prisma.mindsdbJob.findMany({});
  }

  async createMany(data: Prisma.MindsdbJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.mindsdbJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Mindsdb jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.mindsdbJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Mindsdb jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MindsdbJobCreateInput[]) {
    const deleteJobs: Prisma.MindsdbJobCreateInput[] = [];
    const updateJobs: Prisma.MindsdbJobCreateInput[] = [];
    const newJobs: Prisma.MindsdbJobCreateInput[] = [];
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
