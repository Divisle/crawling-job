import { ZockJob, Prisma, PrismaClient } from "@prisma/client";

export class ZockJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ZockJob[]> {
    return this.prisma.zockJob.findMany({});
  }

  async createMany(data: Prisma.ZockJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.zockJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Zock jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zockJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Zock jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZockJobCreateInput[]) {
    const deleteJobs: Prisma.ZockJobCreateInput[] = [];
    const updateJobs: Prisma.ZockJobCreateInput[] = [];
    const newJobs: Prisma.ZockJobCreateInput[] = [];
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
