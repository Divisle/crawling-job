import { EderaJob, Prisma, PrismaClient } from "@prisma/client";

export class EderaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EderaJob[]> {
    return this.prisma.ederaJob.findMany({});
  }

  async createMany(data: Prisma.EderaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.ederaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Edera jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.ederaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Edera jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EderaJobCreateInput[]) {
    const deleteJobs: Prisma.EderaJobCreateInput[] = [];
    const updateJobs: Prisma.EderaJobCreateInput[] = [];
    const newJobs: Prisma.EderaJobCreateInput[] = [];
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
