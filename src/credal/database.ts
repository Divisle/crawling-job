import { CredalJob, Prisma, PrismaClient } from "@prisma/client";

export class CredalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CredalJob[]> {
    return this.prisma.credalJob.findMany({});
  }

  async createMany(data: Prisma.CredalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.credalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Credal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.credalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Credal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CredalJobCreateInput[]) {
    const deleteJobs: Prisma.CredalJobCreateInput[] = [];
    const updateJobs: Prisma.CredalJobCreateInput[] = [];
    const newJobs: Prisma.CredalJobCreateInput[] = [];
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
