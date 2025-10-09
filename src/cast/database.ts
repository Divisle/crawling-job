import { CastAIJob, Prisma, PrismaClient } from "@prisma/client";

export class CastAIJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CastAIJob[]> {
    return this.prisma.castAIJob.findMany({});
  }

  async createMany(data: Prisma.CastAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.castAIJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating CastAI jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.castAIJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting CastAI jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CastAIJobCreateInput[]) {
    const deleteJobs: Prisma.CastAIJobCreateInput[] = [];
    const updateJobs: Prisma.CastAIJobCreateInput[] = [];
    const newJobs: Prisma.CastAIJobCreateInput[] = [];
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
