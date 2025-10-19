import type { ZestJob, Prisma, PrismaClient } from "@prisma/client";

export class ZestJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.ZestJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.zestJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating ZestJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<ZestJob[]> {
    return this.prisma.zestJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zestJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ZestJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZestJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.ZestJobCreateInput[] = [];
    const updateJobs: Prisma.ZestJobCreateInput[] = [];
    const deleteJobs: Prisma.ZestJobCreateInput[] = [];

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
