import { NormAIJob, Prisma, PrismaClient } from "@prisma/client";

export class NormAIJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<NormAIJob[]> {
    return this.prisma.normAIJob.findMany({});
  }

  async createMany(data: Prisma.NormAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.normAIJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating NormAI jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.normAIJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting NormAI jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.NormAIJobCreateInput[]) {
    const deleteJobs: Prisma.NormAIJobCreateInput[] = [];
    const updateJobs: Prisma.NormAIJobCreateInput[] = [];
    const newJobs: Prisma.NormAIJobCreateInput[] = [];
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
