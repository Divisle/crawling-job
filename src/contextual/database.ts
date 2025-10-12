import { ContextualJob, Prisma, PrismaClient } from "@prisma/client";

export class ContextualJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ContextualJob[]> {
    return this.prisma.contextualJob.findMany({});
  }

  async createMany(data: Prisma.ContextualJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.contextualJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Contextual jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.contextualJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Contextual jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ContextualJobCreateInput[]) {
    const deleteJobs: Prisma.ContextualJobCreateInput[] = [];
    const updateJobs: Prisma.ContextualJobCreateInput[] = [];
    const newJobs: Prisma.ContextualJobCreateInput[] = [];
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
