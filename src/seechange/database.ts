import { LoopJob, Prisma, PrismaClient, SeeChangeJob } from "@prisma/client";

export class SeeChangeRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.SeeChangeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.seeChangeJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating SeeChangeJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<SeeChangeJob[]> {
    return this.prisma.seeChangeJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.seeChangeJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting SeeChangeJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SeeChangeJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.SeeChangeJobCreateInput[] = [];
    const updateJobs: Prisma.SeeChangeJobCreateInput[] = [];
    const deleteJobs: Prisma.SeeChangeJobCreateInput[] = [];

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
          existingJob.city !== newJob.city ||
          existingJob.state !== newJob.state ||
          existingJob.department !== newJob.department ||
          existingJob.employmentType !== newJob.employmentType ||
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
