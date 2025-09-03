import type { VorlonJob, Prisma, PrismaClient } from "@prisma/client";

export class VorlonJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.VorlonJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.vorlonJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating VorlonJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<VorlonJob[]> {
    return this.prisma.vorlonJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.vorlonJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting VorlonJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.VorlonJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.VorlonJobCreateInput[] = [];
    const updateJobs: Prisma.VorlonJobCreateInput[] = [];
    const deleteJobs: Prisma.VorlonJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (
        data.every(
          (newJob) =>
            newJob.title !== oldJob.title ||
            newJob.department !== oldJob.department
        )
      ) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) =>
          oldJob.title === newJob.title &&
          oldJob.department === newJob.department
      );
      if (existingJob) {
        if (existingJob.location !== newJob.location) {
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
