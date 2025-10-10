import { RedwoodJob, Prisma, PrismaClient } from "@prisma/client";

export class RedwoodJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RedwoodJob[]> {
    return this.prisma.redwoodJob.findMany({});
  }

  async createMany(data: Prisma.RedwoodJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.redwoodJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Redwood jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.redwoodJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Redwood jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RedwoodJobCreateInput[]) {
    const deleteJobs: Prisma.RedwoodJobCreateInput[] = [];
    const updateJobs: Prisma.RedwoodJobCreateInput[] = [];
    const newJobs: Prisma.RedwoodJobCreateInput[] = [];
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
