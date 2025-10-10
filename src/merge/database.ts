import { MergeJob, Prisma, PrismaClient } from "@prisma/client";

export class MergeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MergeJob[]> {
    return this.prisma.mergeJob.findMany({});
  }

  async createMany(data: Prisma.MergeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.mergeJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Merge jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.mergeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Merge jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MergeJobCreateInput[]) {
    const deleteJobs: Prisma.MergeJobCreateInput[] = [];
    const updateJobs: Prisma.MergeJobCreateInput[] = [];
    const newJobs: Prisma.MergeJobCreateInput[] = [];
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
