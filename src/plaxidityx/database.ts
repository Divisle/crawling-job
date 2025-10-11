import type { PlaxidityxJob, Prisma, PrismaClient } from "@prisma/client";

export class PlaxidityxJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.PlaxidityxJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.plaxidityxJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating PlaxidityxJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<PlaxidityxJob[]> {
    return this.prisma.plaxidityxJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.plaxidityxJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting PlaxidityxJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PlaxidityxJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.PlaxidityxJobCreateInput[] = [];
    const updateJobs: Prisma.PlaxidityxJobCreateInput[] = [];
    const deleteJobs: Prisma.PlaxidityxJobCreateInput[] = [];

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
