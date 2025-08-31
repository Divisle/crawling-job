import { Prisma, PrismaClient, TeleportJob } from "@prisma/client";

export class TeleportJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<TeleportJob[]> {
    return this.prisma.teleportJob.findMany();
  }

  async createMany(
    data: Prisma.TeleportJobCreateManyInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.teleportJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating teleport jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.teleportJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting teleport jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TeleportJobCreateInput[]): Promise<{
    newJobs: Prisma.TeleportJobCreateInput[];
    updateJobs: Prisma.TeleportJobCreateInput[];
    deleteJobs: Prisma.TeleportJobCreateInput[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: Prisma.TeleportJobCreateInput[] = [];
    const updateJobs: Prisma.TeleportJobCreateInput[] = [];
    const deleteJobs: Prisma.TeleportJobCreateInput[] = [];

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
          existingJob.teamName !== job.teamName ||
          existingJob.type !== job.type
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
