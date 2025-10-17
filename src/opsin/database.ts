import { Prisma, PrismaClient, OpsinJob } from "@prisma/client";

export class OpsinJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<OpsinJob[]> {
    return this.prisma.opsinJob.findMany();
  }

  async createMany(data: Prisma.OpsinJobCreateManyInput[]): Promise<boolean> {
    try {
      await this.prisma.opsinJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating opsin jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.opsinJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting opsin jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OpsinJobCreateInput[]): Promise<{
    newJobs: Prisma.OpsinJobCreateInput[];
    updateJobs: Prisma.OpsinJobCreateInput[];
    deleteJobs: Prisma.OpsinJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.OpsinJobCreateInput[] = [];
    const updateJobs: Prisma.OpsinJobCreateInput[] = [];
    const deleteJobs: Prisma.OpsinJobCreateInput[] = [];

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
