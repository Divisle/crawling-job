import { RelyanceJob, Prisma, PrismaClient } from "@prisma/client";

export class RelyanceJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.RelyanceJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.relyanceJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating RelyanceJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<RelyanceJob[]> {
    return this.prisma.relyanceJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.relyanceJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting RelyanceJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RelyanceJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.RelyanceJobCreateInput[] = [];
    const updateJobs: Prisma.RelyanceJobCreateInput[] = [];
    const deleteJobs: Prisma.RelyanceJobCreateInput[] = [];

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
