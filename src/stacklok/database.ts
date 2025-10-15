import { StacklokJob, Prisma, PrismaClient } from "@prisma/client";

export class StacklokJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<StacklokJob[]> {
    return this.prisma.stacklokJob.findMany({});
  }

  async createMany(data: Prisma.StacklokJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.stacklokJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Stacklok jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.stacklokJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Stacklok jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.StacklokJobCreateInput[]) {
    const deleteJobs: Prisma.StacklokJobCreateInput[] = [];
    const updateJobs: Prisma.StacklokJobCreateInput[] = [];
    const newJobs: Prisma.StacklokJobCreateInput[] = [];
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
