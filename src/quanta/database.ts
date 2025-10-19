import type { QuantaJob, Prisma, PrismaClient } from "@prisma/client";

export class QuantaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.QuantaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.quantaJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating QuantaJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<QuantaJob[]> {
    return this.prisma.quantaJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.quantaJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting QuantaJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.QuantaJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.QuantaJobCreateInput[] = [];
    const updateJobs: Prisma.QuantaJobCreateInput[] = [];
    const deleteJobs: Prisma.QuantaJobCreateInput[] = [];

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
