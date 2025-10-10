import { HebbiaJob, Prisma, PrismaClient } from "@prisma/client";

export class HebbiaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HebbiaJob[]> {
    return this.prisma.hebbiaJob.findMany({});
  }

  async createMany(data: Prisma.HebbiaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.hebbiaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Hebbia jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.hebbiaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Hebbia jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HebbiaJobCreateInput[]) {
    const deleteJobs: Prisma.HebbiaJobCreateInput[] = [];
    const updateJobs: Prisma.HebbiaJobCreateInput[] = [];
    const newJobs: Prisma.HebbiaJobCreateInput[] = [];
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
