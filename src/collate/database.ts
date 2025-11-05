import { CollateJob, Prisma, PrismaClient } from "@prisma/client";

export class CollateJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CollateJob[]> {
    return this.prisma.collateJob.findMany({});
  }

  async createMany(data: Prisma.CollateJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.collateJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Collate jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.collateJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Collate jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CollateJobCreateInput[]) {
    const deleteJobs: Prisma.CollateJobCreateInput[] = [];
    const updateJobs: Prisma.CollateJobCreateInput[] = [];
    const newJobs: Prisma.CollateJobCreateInput[] = [];
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
