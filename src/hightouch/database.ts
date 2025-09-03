import type { HightouchJob, Prisma, PrismaClient } from "@prisma/client";

export class HightouchJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.HightouchJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.hightouchJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating HightouchJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<HightouchJob[]> {
    return this.prisma.hightouchJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.hightouchJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting HightouchJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HightouchJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.HightouchJobCreateInput[] = [];
    const updateJobs: Prisma.HightouchJobCreateInput[] = [];
    const deleteJobs: Prisma.HightouchJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (data.every((newJob) => newJob.href !== oldJob.href)) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) => oldJob.href === newJob.href
      );
      if (existingJob) {
        if (
          existingJob.title !== newJob.title ||
          existingJob.location !== newJob.location ||
          existingJob.department !== newJob.department
        ) {
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
