import type { YoobicJob, Prisma, PrismaClient } from "@prisma/client";

export class YoobicJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.YoobicJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.yoobicJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating YoobicJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<YoobicJob[]> {
    return this.prisma.yoobicJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.yoobicJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting YoobicJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.YoobicJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.YoobicJobCreateInput[] = [];
    const updateJobs: Prisma.YoobicJobCreateInput[] = [];
    const deleteJobs: Prisma.YoobicJobCreateInput[] = [];

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
