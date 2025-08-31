import { MaraTalentJob, Prisma, PrismaClient } from "@prisma/client";

export class MaraTalentRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<MaraTalentJob[]> {
    return this.prisma.maraTalentJob.findMany();
  }

  async createMany(data: Prisma.MaraTalentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.maraTalentJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating mara talent jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.maraTalentJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting mara talent jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MaraTalentJobCreateInput[]): Promise<{
    newJobs: Prisma.MaraTalentJobCreateInput[];
    updateJobs: Prisma.MaraTalentJobCreateInput[];
    deleteJobs: Prisma.MaraTalentJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.MaraTalentJobCreateInput[] = [];
    const updateJobs: Prisma.MaraTalentJobCreateInput[] = [];
    const deleteJobs: Prisma.MaraTalentJobCreateInput[] = [];

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
          existingJob.company !== job.company
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
