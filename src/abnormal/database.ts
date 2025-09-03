import type { AbnormalJob, Prisma, PrismaClient } from "@prisma/client";

export class AbnormalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.AbnormalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.abnormalJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating AbnormalJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<AbnormalJob[]> {
    return this.prisma.abnormalJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.abnormalJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting AbnormalJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AbnormalJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.AbnormalJobCreateInput[] = [];
    const updateJobs: Prisma.AbnormalJobCreateInput[] = [];
    const deleteJobs: Prisma.AbnormalJobCreateInput[] = [];

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
