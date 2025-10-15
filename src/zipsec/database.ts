import { ZipsecJob, Prisma, PrismaClient } from "@prisma/client";

export class ZipsecJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ZipsecJob[]> {
    return this.prisma.zipsecJob.findMany({});
  }

  async createMany(data: Prisma.ZipsecJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.zipsecJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Zipsec jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zipsecJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Zipsec jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZipsecJobCreateInput[]) {
    const deleteJobs: Prisma.ZipsecJobCreateInput[] = [];
    const updateJobs: Prisma.ZipsecJobCreateInput[] = [];
    const newJobs: Prisma.ZipsecJobCreateInput[] = [];
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
