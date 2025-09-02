import { Prisma, PrismaClient, DashJob } from "@prisma/client";

export class DashJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<DashJob[]> {
    return this.prisma.dashJob.findMany();
  }

  async createMany(data: Prisma.DashJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dashJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating Dash jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dashJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting Dash jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DashJobCreateInput[]): Promise<{
    newJobs: Prisma.DashJobCreateInput[];
    updateJobs: Prisma.DashJobCreateInput[];
    deleteJobs: Prisma.DashJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.DashJobCreateInput[] = [];
    const updateJobs: Prisma.DashJobCreateInput[] = [];
    const deleteJobs: Prisma.DashJobCreateInput[] = [];

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
