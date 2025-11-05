import { Prisma, PrismaClient, GetimpalaJob } from "@prisma/client";

export class GetimpalaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<GetimpalaJob[]> {
    return this.prisma.getimpalaJob.findMany();
  }

  async createMany(
    data: Prisma.GetimpalaJobCreateManyInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.getimpalaJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating getimpala jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.getimpalaJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting getimpala jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GetimpalaJobCreateInput[]): Promise<{
    newJobs: Prisma.GetimpalaJobCreateInput[];
    updateJobs: Prisma.GetimpalaJobCreateInput[];
    deleteJobs: Prisma.GetimpalaJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.GetimpalaJobCreateInput[] = [];
    const updateJobs: Prisma.GetimpalaJobCreateInput[] = [];
    const deleteJobs: Prisma.GetimpalaJobCreateInput[] = [];

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
          existingJob.location !== job.location
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
