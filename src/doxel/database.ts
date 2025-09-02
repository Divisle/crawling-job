import { Prisma, PrismaClient, DoxelJob } from "@prisma/client";

export class DoxelJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<DoxelJob[]> {
    return this.prisma.doxelJob.findMany();
  }

  async createMany(data: Prisma.DoxelJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.doxelJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating Doxel jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.doxelJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting Doxel jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DoxelJobCreateInput[]): Promise<{
    newJobs: Prisma.DoxelJobCreateInput[];
    updateJobs: Prisma.DoxelJobCreateInput[];
    deleteJobs: Prisma.DoxelJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.DoxelJobCreateInput[] = [];
    const updateJobs: Prisma.DoxelJobCreateInput[] = [];
    const deleteJobs: Prisma.DoxelJobCreateInput[] = [];

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
