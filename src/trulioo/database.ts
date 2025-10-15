import { TruliooJob, Prisma, PrismaClient } from "@prisma/client";

export class TruliooJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TruliooJob[]> {
    return this.prisma.truliooJob.findMany({});
  }

  async createMany(data: Prisma.TruliooJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.truliooJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Trulioo jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.truliooJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Apono jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TruliooJobCreateInput[]) {
    const deleteJobs: Prisma.TruliooJobCreateInput[] = [];
    const updateJobs: Prisma.TruliooJobCreateInput[] = [];
    const newJobs: Prisma.TruliooJobCreateInput[] = [];
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
