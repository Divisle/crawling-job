import { CoderJob, Prisma, PrismaClient } from "@prisma/client";

export class CoderJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CoderJob[]> {
    return this.prisma.coderJob.findMany({});
  }

  async createMany(data: Prisma.CoderJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.coderJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Coder jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.coderJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Coder jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CoderJobCreateInput[]) {
    const deleteJobs: Prisma.CoderJobCreateInput[] = [];
    const updateJobs: Prisma.CoderJobCreateInput[] = [];
    const newJobs: Prisma.CoderJobCreateInput[] = [];
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
