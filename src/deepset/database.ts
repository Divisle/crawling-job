import type { DeepsetJob, Prisma, PrismaClient } from "@prisma/client";

export class DeepsetJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.DeepsetJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.deepsetJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating DeepsetJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<DeepsetJob[]> {
    return this.prisma.deepsetJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.deepsetJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting DeepsetJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DeepsetJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.DeepsetJobCreateInput[] = [];
    const updateJobs: Prisma.DeepsetJobCreateInput[] = [];
    const deleteJobs: Prisma.DeepsetJobCreateInput[] = [];

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
