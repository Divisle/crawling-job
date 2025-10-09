import type { BasetenJob, Prisma, PrismaClient } from "@prisma/client";

export class BasetenJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.BasetenJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.basetenJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating BasetenJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<BasetenJob[]> {
    return this.prisma.basetenJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.basetenJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting BasetenJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BasetenJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.BasetenJobCreateInput[] = [];
    const updateJobs: Prisma.BasetenJobCreateInput[] = [];
    const deleteJobs: Prisma.BasetenJobCreateInput[] = [];

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
          existingJob.location !== newJob.location
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
