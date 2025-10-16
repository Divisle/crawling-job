import { LovableJob, Prisma, PrismaClient } from "@prisma/client";

export class LovableJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LovableJob[]> {
    return this.prisma.lovableJob.findMany({});
  }

  async createMany(data: Prisma.LovableJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lovableJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Lovable jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lovableJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Lovable jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LovableJobCreateInput[]) {
    const deleteJobs: Prisma.LovableJobCreateInput[] = [];
    const updateJobs: Prisma.LovableJobCreateInput[] = [];
    const newJobs: Prisma.LovableJobCreateInput[] = [];
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
