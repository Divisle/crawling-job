import { ClickHouseJob, Prisma, PrismaClient } from "@prisma/client";

export class ClickHouseJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ClickHouseJob[]> {
    return this.prisma.clickHouseJob.findMany({});
  }

  async createMany(data: Prisma.ClickHouseJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.clickHouseJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating ClickHouse jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.clickHouseJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ClickHouse jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ClickHouseJobCreateInput[]) {
    const deleteJobs: Prisma.ClickHouseJobCreateInput[] = [];
    const updateJobs: Prisma.ClickHouseJobCreateInput[] = [];
    const newJobs: Prisma.ClickHouseJobCreateInput[] = [];
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
