import type { EndorLabsJob, Prisma, PrismaClient } from "@prisma/client";

export class EndorLabsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.EndorLabsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.endorLabsJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating EndorLabsJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<EndorLabsJob[]> {
    return this.prisma.endorLabsJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.endorLabsJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting EndorLabsJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EndorLabsJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.EndorLabsJobCreateInput[] = [];
    const updateJobs: Prisma.EndorLabsJobCreateInput[] = [];
    const deleteJobs: Prisma.EndorLabsJobCreateInput[] = [];

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
