import { MoonvalleyJob, Prisma, PrismaClient } from "@prisma/client";

export class MoonvalleyJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MoonvalleyJob[]> {
    return this.prisma.moonvalleyJob.findMany({});
  }

  async createMany(data: Prisma.MoonvalleyJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.moonvalleyJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Moonvalley jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.moonvalleyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Moonvalley jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MoonvalleyJobCreateInput[]) {
    const deleteJobs: Prisma.MoonvalleyJobCreateInput[] = [];
    const updateJobs: Prisma.MoonvalleyJobCreateInput[] = [];
    const newJobs: Prisma.MoonvalleyJobCreateInput[] = [];
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
