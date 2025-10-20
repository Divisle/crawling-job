import type { OsiumJob, Prisma, PrismaClient } from "@prisma/client";

export class OsiumJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.OsiumJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.osiumJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating OsiumJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<OsiumJob[]> {
    return this.prisma.osiumJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.osiumJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting OsiumJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OsiumJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.OsiumJobCreateInput[] = [];
    const updateJobs: Prisma.OsiumJobCreateInput[] = [];
    const deleteJobs: Prisma.OsiumJobCreateInput[] = [];

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
