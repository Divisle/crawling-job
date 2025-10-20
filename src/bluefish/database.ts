import { BluefishJob, Prisma, PrismaClient } from "@prisma/client";

export class BluefishJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BluefishJob[]> {
    return this.prisma.bluefishJob.findMany({});
  }

  async createMany(data: Prisma.BluefishJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.bluefishJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Bluefish jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.bluefishJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Bluefish jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BluefishJobCreateInput[]) {
    const deleteJobs: Prisma.BluefishJobCreateInput[] = [];
    const updateJobs: Prisma.BluefishJobCreateInput[] = [];
    const newJobs: Prisma.BluefishJobCreateInput[] = [];
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
