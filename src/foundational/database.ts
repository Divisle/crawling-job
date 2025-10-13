import { FoundationalJob, Prisma, PrismaClient } from "@prisma/client";

export class FoundationalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FoundationalJob[]> {
    return this.prisma.foundationalJob.findMany({});
  }

  async createMany(
    data: Prisma.FoundationalJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.foundationalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Foundational jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.foundationalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Foundational jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FoundationalJobCreateInput[]) {
    const deleteJobs: Prisma.FoundationalJobCreateInput[] = [];
    const updateJobs: Prisma.FoundationalJobCreateInput[] = [];
    const newJobs: Prisma.FoundationalJobCreateInput[] = [];
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
