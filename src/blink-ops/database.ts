import { BlinkOpsJob, Prisma, PrismaClient } from "@prisma/client";

export class BlinkOpsRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BlinkOpsJob[]> {
    return this.prisma.blinkOpsJob.findMany({});
  }

  async createMany(data: Prisma.BlinkOpsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.blinkOpsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating BlinkOps jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.blinkOpsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting BlinkOps jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BlinkOpsJobCreateInput[]) {
    const deleteJobs: Prisma.BlinkOpsJobCreateInput[] = [];
    const updateJobs: Prisma.BlinkOpsJobCreateInput[] = [];
    const newJobs: Prisma.BlinkOpsJobCreateInput[] = [];
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
