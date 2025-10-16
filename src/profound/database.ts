import { ProfoundJob, Prisma, PrismaClient } from "@prisma/client";

export class ProfoundJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ProfoundJob[]> {
    return this.prisma.profoundJob.findMany({});
  }

  async createMany(data: Prisma.ProfoundJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.profoundJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Profound jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.profoundJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Profound jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ProfoundJobCreateInput[]) {
    const deleteJobs: Prisma.ProfoundJobCreateInput[] = [];
    const updateJobs: Prisma.ProfoundJobCreateInput[] = [];
    const newJobs: Prisma.ProfoundJobCreateInput[] = [];
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
