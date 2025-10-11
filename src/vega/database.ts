import { VegaJob, Prisma, PrismaClient } from "@prisma/client";

export class VegaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<VegaJob[]> {
    return this.prisma.vegaJob.findMany({});
  }

  async createMany(data: Prisma.VegaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.vegaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Vega jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.vegaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Vega jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.VegaJobCreateInput[]) {
    const deleteJobs: Prisma.VegaJobCreateInput[] = [];
    const updateJobs: Prisma.VegaJobCreateInput[] = [];
    const newJobs: Prisma.VegaJobCreateInput[] = [];
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
