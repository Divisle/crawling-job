import { FernJob, Prisma, PrismaClient } from "@prisma/client";

export class FernJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FernJob[]> {
    return this.prisma.fernJob.findMany({});
  }

  async createMany(data: Prisma.FernJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.fernJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Fern jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.fernJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Fern jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FernJobCreateInput[]) {
    const deleteJobs: Prisma.FernJobCreateInput[] = [];
    const updateJobs: Prisma.FernJobCreateInput[] = [];
    const newJobs: Prisma.FernJobCreateInput[] = [];
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
