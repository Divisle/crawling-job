import { LoopJob, Prisma, PrismaClient } from "@prisma/client";

export class LoopRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.LoopJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.loopJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating LoopJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<LoopJob[]> {
    return this.prisma.loopJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.loopJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting LoopJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LoopJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.LoopJobCreateInput[] = [];
    const updateJobs: Prisma.LoopJobCreateInput[] = [];
    const deleteJobs: Prisma.LoopJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (data.every((newJob) => newJob.jobId !== oldJob.jobId)) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) => oldJob.jobId === newJob.jobId
      );
      if (existingJob) {
        if (
          existingJob.title !== newJob.title ||
          existingJob.location !== newJob.location ||
          existingJob.department !== newJob.department ||
          existingJob.href !== newJob.href
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
