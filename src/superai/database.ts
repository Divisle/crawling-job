import { SuperAIJob, Prisma, PrismaClient } from "@prisma/client";

export class SuperAIJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SuperAIJob[]> {
    return this.prisma.superAIJob.findMany({});
  }

  async createMany(data: Prisma.SuperAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.superAIJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating SuperAI jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.superAIJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting SuperAI jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SuperAIJobCreateInput[]) {
    const deleteJobs: Prisma.SuperAIJobCreateInput[] = [];
    const updateJobs: Prisma.SuperAIJobCreateInput[] = [];
    const newJobs: Prisma.SuperAIJobCreateInput[] = [];
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
