import type { OperantaiJob, Prisma, PrismaClient } from "@prisma/client";

export class OperantaiJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.OperantaiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.operantaiJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating OperantaiJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<OperantaiJob[]> {
    return this.prisma.operantaiJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.operantaiJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting OperantaiJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OperantaiJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.OperantaiJobCreateInput[] = [];
    const updateJobs: Prisma.OperantaiJobCreateInput[] = [];
    const deleteJobs: Prisma.OperantaiJobCreateInput[] = [];

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
