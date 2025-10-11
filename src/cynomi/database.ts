import { CynomiJob, Prisma, PrismaClient } from "@prisma/client";

export class CynomiJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CynomiJob[]> {
    return this.prisma.cynomiJob.findMany({});
  }

  async createMany(data: Prisma.CynomiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cynomiJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cynomi jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cynomiJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cynomi jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CynomiJobCreateInput[]) {
    const deleteJobs: Prisma.CynomiJobCreateInput[] = [];
    const updateJobs: Prisma.CynomiJobCreateInput[] = [];
    const newJobs: Prisma.CynomiJobCreateInput[] = [];
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
