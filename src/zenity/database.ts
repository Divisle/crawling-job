import { ZenityJob, Prisma, PrismaClient } from "@prisma/client";

export class ZenityJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ZenityJob[]> {
    return this.prisma.zenityJob.findMany({});
  }

  async createMany(data: Prisma.ZenityJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.zenityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Zenity jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zenityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Zenity jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZenityJobCreateInput[]) {
    const deleteJobs: Prisma.ZenityJobCreateInput[] = [];
    const updateJobs: Prisma.ZenityJobCreateInput[] = [];
    const newJobs: Prisma.ZenityJobCreateInput[] = [];
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
