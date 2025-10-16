import { CogentJob, Prisma, PrismaClient } from "@prisma/client";

export class CogentJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CogentJob[]> {
    return this.prisma.cogentJob.findMany({});
  }

  async createMany(data: Prisma.CogentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cogentJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cogent jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cogentJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cogent jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CogentJobCreateInput[]) {
    const deleteJobs: Prisma.CogentJobCreateInput[] = [];
    const updateJobs: Prisma.CogentJobCreateInput[] = [];
    const newJobs: Prisma.CogentJobCreateInput[] = [];
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
