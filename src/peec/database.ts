import { PeecJob, Prisma, PrismaClient } from "@prisma/client";

export class PeecJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PeecJob[]> {
    return this.prisma.peecJob.findMany({});
  }

  async createMany(data: Prisma.PeecJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.peecJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Peec jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.peecJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Peec jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PeecJobCreateInput[]) {
    const deleteJobs: Prisma.PeecJobCreateInput[] = [];
    const updateJobs: Prisma.PeecJobCreateInput[] = [];
    const newJobs: Prisma.PeecJobCreateInput[] = [];
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
