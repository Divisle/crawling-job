import { Prisma, PrismaClient, ExaforceJob } from "@prisma/client";

export class ExaforceJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<ExaforceJob[]> {
    return this.prisma.exaforceJob.findMany();
  }

  async createMany(
    data: Prisma.ExaforceJobCreateManyInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.exaforceJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating exaforce jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.exaforceJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting exaforce jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ExaforceJobCreateInput[]): Promise<{
    newJobs: Prisma.ExaforceJobCreateInput[];
    updateJobs: Prisma.ExaforceJobCreateInput[];
    deleteJobs: Prisma.ExaforceJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.ExaforceJobCreateInput[] = [];
    const updateJobs: Prisma.ExaforceJobCreateInput[] = [];
    const deleteJobs: Prisma.ExaforceJobCreateInput[] = [];

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
          existingJob.location !== job.location
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
