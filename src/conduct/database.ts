import { ConductJob, Prisma, PrismaClient } from "@prisma/client";

export class ConductJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ConductJob[]> {
    return this.prisma.conductJob.findMany({});
  }

  async createMany(data: Prisma.ConductJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.conductJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Conduct jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.conductJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Conduct jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ConductJobCreateInput[]) {
    const deleteJobs: Prisma.ConductJobCreateInput[] = [];
    const updateJobs: Prisma.ConductJobCreateInput[] = [];
    const newJobs: Prisma.ConductJobCreateInput[] = [];
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
