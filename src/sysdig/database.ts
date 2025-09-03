import { Prisma, PrismaClient, SysdigJob } from "@prisma/client";

export class SysdigJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<SysdigJob[]> {
    return this.prisma.sysdigJob.findMany();
  }

  async createMany(data: Prisma.SysdigJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.sysdigJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating sysdig jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.sysdigJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting sysdig jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SysdigJobCreateInput[]): Promise<{
    newJobs: Prisma.SysdigJobCreateInput[];
    updateJobs: Prisma.SysdigJobCreateInput[];
    deleteJobs: Prisma.SysdigJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.SysdigJobCreateInput[] = [];
    const updateJobs: Prisma.SysdigJobCreateInput[] = [];
    const deleteJobs: Prisma.SysdigJobCreateInput[] = [];

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
          existingJob.group !== job.group ||
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
