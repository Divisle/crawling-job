import { ExaJob, Prisma, PrismaClient } from "@prisma/client";

export class ExaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ExaJob[]> {
    return this.prisma.exaJob.findMany({});
  }

  async createMany(data: Prisma.ExaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.exaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Exa jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.exaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Exa jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ExaJobCreateInput[]) {
    const deleteJobs: Prisma.ExaJobCreateInput[] = [];
    const updateJobs: Prisma.ExaJobCreateInput[] = [];
    const newJobs: Prisma.ExaJobCreateInput[] = [];
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
