import { FiddlerJob, Prisma, PrismaClient } from "@prisma/client";

export class FiddlerJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FiddlerJob[]> {
    return this.prisma.fiddlerJob.findMany({});
  }

  async createMany(data: Prisma.FiddlerJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.fiddlerJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Fiddler jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.fiddlerJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Fiddler jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FiddlerJobCreateInput[]) {
    const deleteJobs: Prisma.FiddlerJobCreateInput[] = [];
    const updateJobs: Prisma.FiddlerJobCreateInput[] = [];
    const newJobs: Prisma.FiddlerJobCreateInput[] = [];
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
