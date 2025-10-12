import { StackOneJob, Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface } from "@src/template";

export class StackOneRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<StackOneJob[]> {
    return this.prisma.stackOneJob.findMany({});
  }

  async createMany(data: Prisma.StackOneJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.stackOneJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating StackOne jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.stackOneJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting StackOne jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.StackOneJobCreateInput[]) {
    const deleteJobs: Prisma.StackOneJobCreateInput[] = [];
    const updateJobs: Prisma.StackOneJobCreateInput[] = [];
    const newJobs: Prisma.StackOneJobCreateInput[] = [];
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
