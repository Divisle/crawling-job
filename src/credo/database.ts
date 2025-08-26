import { CredoJob, Prisma, PrismaClient } from "@prisma/client";

export class CredoJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CredoJob[]> {
    return this.prisma.credoJob.findMany();
  }

  async createMany(data: Prisma.CredoJobCreateInput[]) {
    try {
      await this.prisma.credoJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating Credo jobs:", error);
      return false;
    }
  }

  async updateMany(data: Prisma.CredoJobUpdateInput[]) {
    try {
      await this.prisma.credoJob.updateMany({
        where: {
          jobId: { in: data.map((job) => job.jobId!.toString()) },
        },
        data,
      });
      return true;
    } catch (error) {
      console.error("Error updating Credo jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]) {
    try {
      await this.prisma.credoJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting Credo jobs:", error);
      return false;
    }
  }

  async compareData(jobData: Prisma.CredoJobCreateInput[]): Promise<{
    newJobs: Prisma.CredoJobCreateInput[];
    deleteJobs: Prisma.CredoJobCreateInput[];
    updateJobs: Prisma.CredoJobCreateInput[];
  }> {
    const existingJobs = await this.getAll();
    const newJobs: Prisma.CredoJobCreateInput[] = [];
    const deleteJobs: Prisma.CredoJobCreateInput[] = [];
    const updateJobs: Prisma.CredoJobCreateInput[] = [];

    // Compare incoming job data with existing jobs
    for (const job of jobData) {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        job.title !== existingJob.title ||
        job.location !== existingJob.location ||
        job.department !== existingJob.department ||
        job.workplaceType !== existingJob.workplaceType ||
        job.href !== existingJob.href ||
        job.employmentType !== existingJob.employmentType
      ) {
        updateJobs.push(job);
      }
    }

    // Find jobs to delete
    for (const existingJob of existingJobs) {
      if (!jobData.find((j) => j.jobId === existingJob.jobId)) {
        deleteJobs.push(existingJob);
      }
    }

    return { newJobs, deleteJobs, updateJobs };
  }
}
