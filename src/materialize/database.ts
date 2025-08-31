import type { MaterializeJob, Prisma, PrismaClient } from "@prisma/client";

export class MaterializeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.MaterializeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.materializeJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating MaterializeJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<MaterializeJob[]> {
    return this.prisma.materializeJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.materializeJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting MaterializeJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MaterializeJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.MaterializeJobCreateInput[] = [];
    const updateJobs: Prisma.MaterializeJobCreateInput[] = [];
    const deleteJobs: Prisma.MaterializeJobCreateInput[] = [];

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
