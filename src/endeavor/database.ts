import { EndeavorJob, Prisma, PrismaClient } from "@prisma/client";

export class EndeavorJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EndeavorJob[]> {
    return this.prisma.endeavorJob.findMany({});
  }

  async createMany(data: Prisma.EndeavorJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.endeavorJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Endeavor jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.endeavorJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Endeavor jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EndeavorJobCreateInput[]) {
    const deleteJobs: Prisma.EndeavorJobCreateInput[] = [];
    const updateJobs: Prisma.EndeavorJobCreateInput[] = [];
    const newJobs: Prisma.EndeavorJobCreateInput[] = [];
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
