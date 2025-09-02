import type { RoboFlowJob, Prisma, PrismaClient } from "@prisma/client";

export class RoboFlowJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.RoboFlowJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.roboFlowJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating RoboFlowJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<RoboFlowJob[]> {
    return this.prisma.roboFlowJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.roboFlowJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting RoboFlowJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RoboFlowJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.RoboFlowJobCreateInput[] = [];
    const updateJobs: Prisma.RoboFlowJobCreateInput[] = [];
    const deleteJobs: Prisma.RoboFlowJobCreateInput[] = [];

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
