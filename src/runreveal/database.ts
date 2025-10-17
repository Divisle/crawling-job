import { RunrevealJob, Prisma, PrismaClient } from "@prisma/client";

export class RunrevealJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RunrevealJob[]> {
    return this.prisma.runrevealJob.findMany({});
  }

  async createMany(data: Prisma.RunrevealJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.runrevealJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Runreveal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.runrevealJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Runreveal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RunrevealJobCreateInput[]) {
    const deleteJobs: Prisma.RunrevealJobCreateInput[] = [];
    const updateJobs: Prisma.RunrevealJobCreateInput[] = [];
    const newJobs: Prisma.RunrevealJobCreateInput[] = [];
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
