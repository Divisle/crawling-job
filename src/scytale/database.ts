import type { ScytaleJob, Prisma, PrismaClient } from "@prisma/client";

export class ScytaleJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.ScytaleJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.scytaleJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating ScytaleJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<ScytaleJob[]> {
    return this.prisma.scytaleJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.scytaleJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ScytaleJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ScytaleJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.ScytaleJobCreateInput[] = [];
    const updateJobs: Prisma.ScytaleJobCreateInput[] = [];
    const deleteJobs: Prisma.ScytaleJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (
        data.every(
          (newJob) =>
            newJob.href !== oldJob.href || newJob.location !== oldJob.location
        )
      ) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) =>
          oldJob.href === newJob.href && oldJob.location === newJob.location
      );
      if (existingJob) {
        if (existingJob.title !== newJob.title) {
          updateJobs.push({
            id: existingJob.id,
            ...newJob,
          });
        }
      } else {
        newJobs.push(newJob);
      }
    });
    return { deleteJobs, newJobs, updateJobs };
  }
}
