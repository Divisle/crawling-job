import { ReplicateJob, Prisma, PrismaClient } from "@prisma/client";

export class ReplicateJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ReplicateJob[]> {
    return this.prisma.replicateJob.findMany({});
  }

  async createMany(data: Prisma.ReplicateJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.replicateJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Replicate jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.replicateJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Replicate jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ReplicateJobCreateInput[]) {
    const deleteJobs: Prisma.ReplicateJobCreateInput[] = [];
    const updateJobs: Prisma.ReplicateJobCreateInput[] = [];
    const newJobs: Prisma.ReplicateJobCreateInput[] = [];
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
