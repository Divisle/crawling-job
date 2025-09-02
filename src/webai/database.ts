import { WebaiJob, Prisma, PrismaClient } from "@prisma/client";

export class WebaiRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WebaiJob[]> {
    return await this.prisma.webaiJob.findMany();
  }

  async createMany(data: Prisma.WebaiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.webaiJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Webai jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.webaiJob.deleteMany({
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

  async compareData(data: Prisma.WebaiJobCreateInput[]): Promise<{
    newJobs: Prisma.WebaiJobCreateInput[];
    updateJobs: Prisma.WebaiJobCreateInput[];
    deleteJobs: Prisma.WebaiJobCreateInput[];
  }> {
    const existingJobs = await this.getAll();
    const newJobs: Prisma.WebaiJobCreateInput[] = [];
    const updateJobs: Prisma.WebaiJobCreateInput[] = [];
    const deleteJobs: Prisma.WebaiJobCreateInput[] = [];
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
