import type { FormantJob, Prisma, PrismaClient } from "@prisma/client";

export class FormantJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.FormantJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.formantJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating FormantJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<FormantJob[]> {
    return this.prisma.formantJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.formantJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting FormantJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FormantJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.FormantJobCreateInput[] = [];
    const updateJobs: Prisma.FormantJobCreateInput[] = [];
    const deleteJobs: Prisma.FormantJobCreateInput[] = [];

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
