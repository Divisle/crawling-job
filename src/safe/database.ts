import { Prisma, PrismaClient, SafeJob } from "@prisma/client";

export class SafeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<SafeJob[]> {
    return this.prisma.safeJob.findMany();
  }

  async createMany(data: Prisma.SafeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.safeJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating safe jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.safeJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting safe jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SafeJobCreateInput[]): Promise<{
    newJobs: Prisma.SafeJobCreateInput[];
    updateJobs: Prisma.SafeJobCreateInput[];
    deleteJobs: Prisma.SafeJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.SafeJobCreateInput[] = [];
    const updateJobs: Prisma.SafeJobCreateInput[] = [];
    const deleteJobs: Prisma.SafeJobCreateInput[] = [];

    existingJobs.forEach((existingJob) => {
      const job = data.find((j) => j.href === existingJob.href);
      if (!job) {
        deleteJobs.push(existingJob);
      }
    });

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (!existingJob) {
        newJobs.push(job);
      } else {
        if (
          existingJob.title !== job.title ||
          existingJob.location !== job.location ||
          existingJob.department !== job.department ||
          existingJob.group !== job.group ||
          existingJob.workplaceType !== job.workplaceType ||
          existingJob.employmentType !== job.employmentType
        ) {
          updateJobs.push({
            id: existingJob.id,
            ...job,
          });
        }
      }
    });

    return { newJobs, updateJobs, deleteJobs };
  }
}
