import { CockroachLabsJob, Prisma, PrismaClient } from "@prisma/client";

export class CockroachLabsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CockroachLabsJob[]> {
    return this.prisma.cockroachLabsJob.findMany({});
  }

  async createMany(
    data: Prisma.CockroachLabsJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.cockroachLabsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cockroach Labs jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cockroachLabsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cockroach Labs jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CockroachLabsJobCreateInput[]) {
    const deleteJobs: Prisma.CockroachLabsJobCreateInput[] = [];
    const updateJobs: Prisma.CockroachLabsJobCreateInput[] = [];
    const newJobs: Prisma.CockroachLabsJobCreateInput[] = [];
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
