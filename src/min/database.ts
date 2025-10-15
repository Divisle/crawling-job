import { MinJob, Prisma, PrismaClient } from "@prisma/client";

export class MinJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MinJob[]> {
    return this.prisma.minJob.findMany({});
  }

  async createMany(data: Prisma.MinJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.minJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating MinIO jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.minJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting MinIO jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MinJobCreateInput[]) {
    const deleteJobs: Prisma.MinJobCreateInput[] = [];
    const updateJobs: Prisma.MinJobCreateInput[] = [];
    const newJobs: Prisma.MinJobCreateInput[] = [];
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
