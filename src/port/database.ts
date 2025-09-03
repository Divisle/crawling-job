import type { PortJob, Prisma, PrismaClient } from "@prisma/client";

export class PortJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.PortJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.portJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating PortJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<PortJob[]> {
    return this.prisma.portJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.portJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting PortJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PortJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.PortJobCreateInput[] = [];
    const updateJobs: Prisma.PortJobCreateInput[] = [];
    const deleteJobs: Prisma.PortJobCreateInput[] = [];

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
