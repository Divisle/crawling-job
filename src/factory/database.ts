import type { FactoryJob, Prisma, PrismaClient } from "@prisma/client";

export class FactoryJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.FactoryJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.factoryJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating FactoryJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<FactoryJob[]> {
    return this.prisma.factoryJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.factoryJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting FactoryJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FactoryJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.FactoryJobCreateInput[] = [];
    const updateJobs: Prisma.FactoryJobCreateInput[] = [];
    const deleteJobs: Prisma.FactoryJobCreateInput[] = [];

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
