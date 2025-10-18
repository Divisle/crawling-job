import { LinxJob, Prisma, PrismaClient } from "@prisma/client";

export class LinxRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LinxJob[]> {
    return this.prisma.linxJob.findMany({});
  }

  async createMany(data: Prisma.LinxJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.linxJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Linx jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.linxJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Linx jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LinxJobCreateInput[]) {
    const deleteJobs: Prisma.LinxJobCreateInput[] = [];
    const updateJobs: Prisma.LinxJobCreateInput[] = [];
    const newJobs: Prisma.LinxJobCreateInput[] = [];
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
