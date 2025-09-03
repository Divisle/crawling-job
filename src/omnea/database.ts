import { OmneaJob, Prisma, PrismaClient } from "@prisma/client";

export class OmneaRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OmneaJob[]> {
    return await this.prisma.omneaJob.findMany();
  }

  async createMany(data: Prisma.OmneaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.omneaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Omnea jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.omneaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Omnea jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OmneaJobCreateInput[]): Promise<{
    newJobs: Prisma.OmneaJobCreateInput[];
    updateJobs: Prisma.OmneaJobCreateInput[];
    deleteJobs: Prisma.OmneaJobCreateInput[];
  }> {
    const existingJobs = await this.getAll();
    const newJobs: Prisma.OmneaJobCreateInput[] = [];
    const updateJobs: Prisma.OmneaJobCreateInput[] = [];
    const deleteJobs: Prisma.OmneaJobCreateInput[] = [];
    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        job.title !== existingJob.title ||
        job.location !== existingJob.location ||
        job.department !== existingJob.department ||
        job.employmentType !== existingJob.employmentType ||
        job.href !== existingJob.href ||
        job.compensation !== existingJob.compensation
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
