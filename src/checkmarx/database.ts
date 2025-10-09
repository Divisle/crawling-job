import type { CheckmarxJob, Prisma, PrismaClient } from "@prisma/client";

export class CheckmarxJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.CheckmarxJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.checkmarxJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating CheckmarxJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<CheckmarxJob[]> {
    return this.prisma.checkmarxJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.checkmarxJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting CheckmarxJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CheckmarxJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.CheckmarxJobCreateInput[] = [];
    const updateJobs: Prisma.CheckmarxJobCreateInput[] = [];
    const deleteJobs: Prisma.CheckmarxJobCreateInput[] = [];

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
