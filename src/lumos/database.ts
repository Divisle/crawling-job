import { LumosJob, Prisma, PrismaClient } from "@prisma/client";

export class LumosJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LumosJob[]> {
    return await this.prisma.lumosJob.findMany();
  }

  async createMany(data: Prisma.LumosJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lumosJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating lumos jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lumosJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting lumos jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LumosJobCreateInput[]): Promise<{
    newJobs: Prisma.LumosJobCreateInput[];
    updateJobs: Prisma.LumosJobCreateInput[];
    deleteJobs: Prisma.LumosJobCreateInput[];
  }> {
    const newJobs: Prisma.LumosJobCreateInput[] = [];
    const updateJobs: Prisma.LumosJobCreateInput[] = [];
    const deleteJobs: Prisma.LumosJobCreateInput[] = [];
    const existingJobs = await this.getAll();
    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        existingJob.title !== job.title ||
        existingJob.location !== job.location ||
        existingJob.href !== job.href
      ) {
        updateJobs.push({
          ...job,
          id: existingJob.id,
        });
      }
    });
    existingJobs.forEach((job) => {
      const found = data.find((j) => j.jobId === job.jobId);
      if (!found) {
        deleteJobs.push(job);
      }
    });
    return {
      newJobs,
      updateJobs,
      deleteJobs,
    };
  }
}
