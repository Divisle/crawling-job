import { InstruqtJob, Prisma, PrismaClient } from "@prisma/client";

export class InstruqtJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<InstruqtJob[]> {
    return this.prisma.instruqtJob.findMany({});
  }

  async createMany(data: Prisma.InstruqtJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.instruqtJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Instruqt jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.instruqtJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Instruqt jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.InstruqtJobCreateInput[]) {
    const deleteJobs: Prisma.InstruqtJobCreateInput[] = [];
    const updateJobs: Prisma.InstruqtJobCreateInput[] = [];
    const newJobs: Prisma.InstruqtJobCreateInput[] = [];
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
