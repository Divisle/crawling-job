import { NavanJob, Prisma, PrismaClient } from "@prisma/client";

export class NavanJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<NavanJob[]> {
    return this.prisma.navanJob.findMany({});
  }

  async createMany(data: Prisma.NavanJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.navanJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Navan jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.navanJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Navan jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.NavanJobCreateInput[]) {
    const deleteJobs: Prisma.NavanJobCreateInput[] = [];
    const updateJobs: Prisma.NavanJobCreateInput[] = [];
    const newJobs: Prisma.NavanJobCreateInput[] = [];
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
