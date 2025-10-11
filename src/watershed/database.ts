import { WatershedJob, Prisma, PrismaClient } from "@prisma/client";

export class WatershedRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WatershedJob[]> {
    return this.prisma.watershedJob.findMany({});
  }

  async createMany(data: Prisma.WatershedJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.watershedJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Watershed jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.watershedJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Watershed jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WatershedJobCreateInput[]) {
    const deleteJobs: Prisma.WatershedJobCreateInput[] = [];
    const updateJobs: Prisma.WatershedJobCreateInput[] = [];
    const newJobs: Prisma.WatershedJobCreateInput[] = [];
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
