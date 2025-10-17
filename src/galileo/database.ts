import { GalileoJob, Prisma, PrismaClient } from "@prisma/client";

export class GalileoRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<GalileoJob[]> {
    return this.prisma.galileoJob.findMany({});
  }

  async createMany(data: Prisma.GalileoJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.galileoJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Galileo jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.galileoJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Galileo jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GalileoJobCreateInput[]) {
    const deleteJobs: Prisma.GalileoJobCreateInput[] = [];
    const updateJobs: Prisma.GalileoJobCreateInput[] = [];
    const newJobs: Prisma.GalileoJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find(
        (j) => j.href === job.href && j.location === job.location
      );
      if (existingJob) {
        if (existingJob.title === job.title) {
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
      const locExists = data.find(
        (j) => j.href === job.href && j.location === job.location
      );
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
