import { LegitJob, Prisma, PrismaClient } from "@prisma/client";

export class LegitJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LegitJob[]> {
    return this.prisma.legitJob.findMany({});
  }

  async createMany(data: Prisma.LegitJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.legitJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Legit jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.legitJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Legit jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LegitJobCreateInput[]) {
    const deleteJobs: Prisma.LegitJobCreateInput[] = [];
    const updateJobs: Prisma.LegitJobCreateInput[] = [];
    const newJobs: Prisma.LegitJobCreateInput[] = [];
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
