import { ChronosphereJob, Prisma, PrismaClient } from "@prisma/client";

export class ChronosphereJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ChronosphereJob[]> {
    return this.prisma.chronosphereJob.findMany({});
  }

  async createMany(
    data: Prisma.ChronosphereJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.chronosphereJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Chronosphere jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.chronosphereJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Chronosphere jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ChronosphereJobCreateInput[]) {
    const deleteJobs: Prisma.ChronosphereJobCreateInput[] = [];
    const updateJobs: Prisma.ChronosphereJobCreateInput[] = [];
    const newJobs: Prisma.ChronosphereJobCreateInput[] = [];
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
