import { HarperJob, Prisma, PrismaClient } from "@prisma/client";

export class HarperJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HarperJob[]> {
    return this.prisma.harperJob.findMany({});
  }

  async createMany(data: Prisma.HarperJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.harperJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Harper jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.harperJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Harper jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HarperJobCreateInput[]) {
    const deleteJobs: Prisma.HarperJobCreateInput[] = [];
    const updateJobs: Prisma.HarperJobCreateInput[] = [];
    const newJobs: Prisma.HarperJobCreateInput[] = [];
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
