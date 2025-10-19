import { StarcloudJob, Prisma, PrismaClient } from "@prisma/client";

export class StarcloudJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<StarcloudJob[]> {
    return this.prisma.starcloudJob.findMany({});
  }

  async createMany(data: Prisma.StarcloudJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.starcloudJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Starcloud jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.starcloudJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Starcloud jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.StarcloudJobCreateInput[]) {
    const deleteJobs: Prisma.StarcloudJobCreateInput[] = [];
    const updateJobs: Prisma.StarcloudJobCreateInput[] = [];
    const newJobs: Prisma.StarcloudJobCreateInput[] = [];
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
