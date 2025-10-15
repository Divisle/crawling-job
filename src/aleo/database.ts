import { AleoJob, Prisma, PrismaClient } from "@prisma/client";

export class AleoJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AleoJob[]> {
    return this.prisma.aleoJob.findMany({});
  }

  async createMany(data: Prisma.AleoJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.aleoJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Aleo jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.aleoJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Aleo jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AleoJobCreateInput[]) {
    const deleteJobs: Prisma.AleoJobCreateInput[] = [];
    const updateJobs: Prisma.AleoJobCreateInput[] = [];
    const newJobs: Prisma.AleoJobCreateInput[] = [];
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
