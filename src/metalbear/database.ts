import { MetalBearJob, Prisma, PrismaClient } from "@prisma/client";

export class MetalBearRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MetalBearJob[]> {
    return this.prisma.metalBearJob.findMany({});
  }

  async createMany(data: Prisma.MetalBearJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.metalBearJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating MetalBear jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.metalBearJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting MetalBear jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MetalBearJobCreateInput[]) {
    const deleteJobs: Prisma.MetalBearJobCreateInput[] = [];
    const updateJobs: Prisma.MetalBearJobCreateInput[] = [];
    const newJobs: Prisma.MetalBearJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.href === job.href);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
