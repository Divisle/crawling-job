import { ArdoqJob, Prisma, PrismaClient } from "@prisma/client";

export class ArdoqJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ArdoqJob[]> {
    return this.prisma.ardoqJob.findMany({});
  }

  async createMany(data: Prisma.ArdoqJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.ardoqJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Ardoq jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.ardoqJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Ardoq jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ArdoqJobCreateInput[]) {
    const deleteJobs: Prisma.ArdoqJobCreateInput[] = [];
    const updateJobs: Prisma.ArdoqJobCreateInput[] = [];
    const newJobs: Prisma.ArdoqJobCreateInput[] = [];
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
