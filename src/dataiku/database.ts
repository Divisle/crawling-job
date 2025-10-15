import { DataikuJob, Prisma, PrismaClient } from "@prisma/client";

export class DataikuJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DataikuJob[]> {
    return this.prisma.dataikuJob.findMany({});
  }

  async createMany(data: Prisma.DataikuJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.dataikuJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Dataiku jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.dataikuJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Dataiku jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DataikuJobCreateInput[]) {
    const deleteJobs: Prisma.DataikuJobCreateInput[] = [];
    const updateJobs: Prisma.DataikuJobCreateInput[] = [];
    const newJobs: Prisma.DataikuJobCreateInput[] = [];
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
