import type { GetbalanceJob, Prisma, PrismaClient } from "@prisma/client";

export class GetbalanceJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.GetbalanceJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.getbalanceJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating GetbalanceJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<GetbalanceJob[]> {
    return this.prisma.getbalanceJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.getbalanceJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting GetbalanceJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GetbalanceJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.GetbalanceJobCreateInput[] = [];
    const updateJobs: Prisma.GetbalanceJobCreateInput[] = [];
    const deleteJobs: Prisma.GetbalanceJobCreateInput[] = [];

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
