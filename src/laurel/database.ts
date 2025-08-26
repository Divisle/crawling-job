import { LaurelJob, Prisma, PrismaClient } from "@prisma/client";

export class LaurelRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LaurelJob[]> {
    return await this.prisma.laurelJob.findMany();
  }

  async createMany(data: LaurelJob[]): Promise<boolean> {
    try {
      await this.prisma.laurelJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Laurel jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.laurelJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Laurel jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LaurelJobCreateInput[]): Promise<{
    newJobs: Prisma.LaurelJobCreateInput[];
    updateJobs: Prisma.LaurelJobCreateInput[];
    deleteJobs: Prisma.LaurelJobCreateInput[];
  }> {
    const existingJobs = await this.getAll();
    const newJobs: Prisma.LaurelJobCreateInput[] = [];
    const updateJobs: Prisma.LaurelJobCreateInput[] = [];
    const deleteJobs: Prisma.LaurelJobCreateInput[] = [];
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
