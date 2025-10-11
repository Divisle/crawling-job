import { SnorkelAIJob, Prisma, PrismaClient } from "@prisma/client";

export class SnorkelAIJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SnorkelAIJob[]> {
    return this.prisma.snorkelAIJob.findMany({});
  }

  async createMany(data: Prisma.SnorkelAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.snorkelAIJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating SnorkelAI jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.snorkelAIJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting SnorkelAI jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SnorkelAIJobCreateInput[]) {
    const deleteJobs: Prisma.SnorkelAIJobCreateInput[] = [];
    const updateJobs: Prisma.SnorkelAIJobCreateInput[] = [];
    const newJobs: Prisma.SnorkelAIJobCreateInput[] = [];
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
