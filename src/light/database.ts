import { Prisma, PrismaClient, LightJob } from "@prisma/client";

export class LightJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<LightJob[]> {
    return this.prisma.lightJob.findMany();
  }

  async createMany(data: Prisma.LightJobCreateManyInput[]): Promise<boolean> {
    try {
      await this.prisma.lightJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating light jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lightJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting light jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LightJobCreateInput[]): Promise<{
    newJobs: Prisma.LightJobCreateInput[];
    updateJobs: Prisma.LightJobCreateInput[];
    deleteJobs: Prisma.LightJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.LightJobCreateInput[] = [];
    const updateJobs: Prisma.LightJobCreateInput[] = [];
    const deleteJobs: Prisma.LightJobCreateInput[] = [];

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
