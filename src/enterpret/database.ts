import type { EnterpretJob, Prisma, PrismaClient } from "@prisma/client";

export class EnterpretJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.EnterpretJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.enterpretJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating EnterpretJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<EnterpretJob[]> {
    return this.prisma.enterpretJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.enterpretJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting EnterpretJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EnterpretJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.EnterpretJobCreateInput[] = [];
    const updateJobs: Prisma.EnterpretJobCreateInput[] = [];
    const deleteJobs: Prisma.EnterpretJobCreateInput[] = [];

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
