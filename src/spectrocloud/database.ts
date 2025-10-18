import type { SpectrocloudJob, Prisma, PrismaClient } from "@prisma/client";

export class SpectrocloudJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(
    data: Prisma.SpectrocloudJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.spectrocloudJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating SpectrocloudJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<SpectrocloudJob[]> {
    return this.prisma.spectrocloudJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.spectrocloudJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting SpectrocloudJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SpectrocloudJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.SpectrocloudJobCreateInput[] = [];
    const updateJobs: Prisma.SpectrocloudJobCreateInput[] = [];
    const deleteJobs: Prisma.SpectrocloudJobCreateInput[] = [];

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
