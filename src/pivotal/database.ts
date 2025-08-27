import { PivotalJob, Prisma, PrismaClient } from "@prisma/client";

export class PivotalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PivotalJob[]> {
    return await this.prisma.pivotalJob.findMany();
  }

  async createMany(data: Prisma.PivotalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.pivotalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating PivotalJobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.pivotalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting PivotalJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PivotalJobCreateInput[]): Promise<{
    newJobs: Prisma.PivotalJobCreateInput[];
    updateJobs: Prisma.PivotalJobCreateInput[];
    deleteJobs: Prisma.PivotalJobCreateInput[];
  }> {
    const newJobs: Prisma.PivotalJobCreateInput[] = [];
    const updateJobs: Prisma.PivotalJobCreateInput[] = [];
    const deleteJobs: Prisma.PivotalJobCreateInput[] = [];
    const existingJobs = await this.getAll();
    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        existingJob.title !== job.title ||
        existingJob.location !== job.location
      ) {
        updateJobs.push({
          ...job,
          id: existingJob.id,
        });
      }
    });
    existingJobs.forEach((job) => {
      const found = data.find((j) => j.href === job.href);
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
