import type { PlanhatJob, Prisma, PrismaClient } from "@prisma/client";

export class PlanhatJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.PlanhatJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.planhatJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating PlanhatJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<PlanhatJob[]> {
    return this.prisma.planhatJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.planhatJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting PlanhatJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PlanhatJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.PlanhatJobCreateInput[] = [];
    const updateJobs: Prisma.PlanhatJobCreateInput[] = [];
    const deleteJobs: Prisma.PlanhatJobCreateInput[] = [];

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
