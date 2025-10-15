import { ScylladbJob, Prisma, PrismaClient } from "@prisma/client";

export class ScylladbJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ScylladbJob[]> {
    return this.prisma.scylladbJob.findMany({});
  }

  async createMany(data: Prisma.ScylladbJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.scylladbJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating ScyllaDB jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.scylladbJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ScyllaDB jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ScylladbJobCreateInput[]) {
    const deleteJobs: Prisma.ScylladbJobCreateInput[] = [];
    const updateJobs: Prisma.ScylladbJobCreateInput[] = [];
    const newJobs: Prisma.ScylladbJobCreateInput[] = [];
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
