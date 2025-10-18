import { SalientJob, Prisma, PrismaClient } from "@prisma/client";

export class SalientJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SalientJob[]> {
    return this.prisma.salientJob.findMany({});
  }

  async createMany(data: Prisma.SalientJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.salientJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Salient jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.salientJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Salient jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SalientJobCreateInput[]) {
    const deleteJobs: Prisma.SalientJobCreateInput[] = [];
    const updateJobs: Prisma.SalientJobCreateInput[] = [];
    const newJobs: Prisma.SalientJobCreateInput[] = [];
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
