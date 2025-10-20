import type { ZiplineRetailJob, Prisma, PrismaClient } from "@prisma/client";

export class ZiplineRetailJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(
    data: Prisma.ZiplineRetailJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.ziplineRetailJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating ZiplineRetailJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<ZiplineRetailJob[]> {
    return this.prisma.ziplineRetailJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.ziplineRetailJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ZiplineRetailJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZiplineRetailJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.ZiplineRetailJobCreateInput[] = [];
    const updateJobs: Prisma.ZiplineRetailJobCreateInput[] = [];
    const deleteJobs: Prisma.ZiplineRetailJobCreateInput[] = [];

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
