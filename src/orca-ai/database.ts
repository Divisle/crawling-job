import type { OrcaAIJob, Prisma, PrismaClient } from "@prisma/client";

export class OrcaAIJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.OrcaAIJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.orcaAIJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating OrcaAIJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<OrcaAIJob[]> {
    return this.prisma.orcaAIJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.orcaAIJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting OrcaAIJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OrcaAIJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.OrcaAIJobCreateInput[] = [];
    const updateJobs: Prisma.OrcaAIJobCreateInput[] = [];
    const deleteJobs: Prisma.OrcaAIJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (data.every((newJob) => newJob.href !== oldJob.href)) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) => oldJob.href === newJob.href
      );
      if (existingJob) {
        if (
          existingJob.title !== newJob.title ||
          existingJob.location !== newJob.location
        ) {
          updateJobs.push({
            id: existingJob.id,
            ...newJob,
          });
        }
      } else {
        newJobs.push(newJob);
      }
    });
    return { deleteJobs, newJobs, updateJobs };
  }
}
