import type { AnomaloJob, Prisma, PrismaClient } from "@prisma/client";

export class AnomaloJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.AnomaloJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.anomaloJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating AnomaloJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<AnomaloJob[]> {
    return this.prisma.anomaloJob.findMany();
  }

  async findById(id: string): Promise<AnomaloJob | null> {
    try {
      const job = await this.prisma.anomaloJob.findUnique({ where: { id } });
      return job;
    } catch (error) {
      console.error("Error finding AnomaloJob by ID:", error);
      return null;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.anomaloJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting AnomaloJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AnomaloJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.AnomaloJobCreateInput[] = [];
    const updateJobs: Prisma.AnomaloJobCreateInput[] = [];
    const deleteJobs: Prisma.AnomaloJobCreateInput[] = [];
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
          existingJob.location !== newJob.location ||
          existingJob.department !== newJob.department
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
