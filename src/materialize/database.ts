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
    const deleteJobs = oldJobData.filter((oldJob) =>
      data.every((newJob) => newJob.href !== oldJob.href)
    );
    const newJobs = data.filter((newJob) =>
      oldJobData.every((oldJob) => oldJob.href !== newJob.href)
    );
    const updateJobs = oldJobData.filter((oldJob) =>
      data.some(
        (newJob) =>
          newJob.href === oldJob.href &&
          (newJob.title !== oldJob.title ||
            newJob.location !== oldJob.location ||
            newJob.department !== oldJob.department)
      )
    );

    return { deleteJobs, newJobs, updateJobs };
  }
}
