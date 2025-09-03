import { IoJob, Prisma, PrismaClient } from "@prisma/client";

export class IoJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<IoJob[]> {
    return await this.prisma.ioJob.findMany();
  }

  async createMany(data: Prisma.IoJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.ioJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Io jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.ioJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Io jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.IoJobCreateInput[]): Promise<{
    newJobs: Prisma.IoJobCreateInput[];
    updateJobs: Prisma.IoJobCreateInput[];
    deleteJobs: Prisma.IoJobCreateInput[];
  }> {
    const existingJobs = await this.getAll();
    const newJobs: Prisma.IoJobCreateInput[] = [];
    const updateJobs: Prisma.IoJobCreateInput[] = [];
    const deleteJobs: Prisma.IoJobCreateInput[] = [];
    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        job.title !== existingJob.title ||
        job.location !== existingJob.location ||
        job.department !== existingJob.department ||
        job.employmentType !== existingJob.employmentType ||
        job.href !== existingJob.href
      ) {
        updateJobs.push({ ...job, id: existingJob.id });
      }
    });
    existingJobs.forEach((existingJob) => {
      if (!data.find((j) => j.jobId === existingJob.jobId)) {
        deleteJobs.push(existingJob);
      }
    });
    return {
      newJobs,
      updateJobs,
      deleteJobs,
    };
  }
}
