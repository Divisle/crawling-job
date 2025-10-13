import { TwingateJob, Prisma, PrismaClient } from "@prisma/client";

export class TwingateJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TwingateJob[]> {
    return this.prisma.twingateJob.findMany({});
  }

  async createMany(data: Prisma.TwingateJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.twingateJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Twingate jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.twingateJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Twingate jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TwingateJobCreateInput[]) {
    const deleteJobs: Prisma.TwingateJobCreateInput[] = [];
    const updateJobs: Prisma.TwingateJobCreateInput[] = [];
    const newJobs: Prisma.TwingateJobCreateInput[] = [];
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
