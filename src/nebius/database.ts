import { NebiusJob, Prisma, PrismaClient } from "@prisma/client";

export class NebiusJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<NebiusJob[]> {
    return this.prisma.nebiusJob.findMany({});
  }

  async createMany(data: Prisma.NebiusJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.nebiusJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Nebius jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.nebiusJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Nebius jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.NebiusJobCreateInput[]) {
    const deleteJobs: Prisma.NebiusJobCreateInput[] = [];
    const updateJobs: Prisma.NebiusJobCreateInput[] = [];
    const newJobs: Prisma.NebiusJobCreateInput[] = [];
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
