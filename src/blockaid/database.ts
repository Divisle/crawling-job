import type { BlockaidJob, Prisma, PrismaClient } from "@prisma/client";

export class BlockaidJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.BlockaidJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.blockaidJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating BlockaidJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<BlockaidJob[]> {
    return this.prisma.blockaidJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.blockaidJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting BlockaidJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BlockaidJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.BlockaidJobCreateInput[] = [];
    const updateJobs: Prisma.BlockaidJobCreateInput[] = [];
    const deleteJobs: Prisma.BlockaidJobCreateInput[] = [];

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
