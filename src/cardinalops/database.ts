import type { CardinalopsJob, Prisma, PrismaClient } from "@prisma/client";

export class CardinalopsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.CardinalopsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cardinalopsJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating CardinalopsJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<CardinalopsJob[]> {
    return this.prisma.cardinalopsJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cardinalopsJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting CardinalopsJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CardinalopsJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.CardinalopsJobCreateInput[] = [];
    const updateJobs: Prisma.CardinalopsJobCreateInput[] = [];
    const deleteJobs: Prisma.CardinalopsJobCreateInput[] = [];

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
          existingJob.meta !== newJob.meta ||
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
