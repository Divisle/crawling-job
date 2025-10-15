import { UnframeJob, Prisma, PrismaClient } from "@prisma/client";

export class UnframeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<UnframeJob[]> {
    return this.prisma.unframeJob.findMany({});
  }

  async createMany(data: Prisma.UnframeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.unframeJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Unframe jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.unframeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Unframe jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.UnframeJobCreateInput[]) {
    const deleteJobs: Prisma.UnframeJobCreateInput[] = [];
    const updateJobs: Prisma.UnframeJobCreateInput[] = [];
    const newJobs: Prisma.UnframeJobCreateInput[] = [];
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
